import "server-only";
import { pool } from "@/lib/db";
import { ADDON_OPTIONS, type AddonKey } from "@/data/addons";
import { MIN_PEOPLE } from "@/data/booking";

// ============================================================
// ملف التسعير — سيرفر فقط (Server Only)
// ============================================================
// تحذير مهم جدًا: هذا الملف يتعامل مع كل أسعار الشركة الداخلية
// (تكلفة الفرد، تكلفة السيارات، هامش الربح...) المخزّنة في قاعدة البيانات
// وتُعدَّل فقط من لوحة الأدمن على /admin/pricing
// هذا الملف يُستخدم فقط داخل API Routes على السيرفر
// يجب ألا يتم استيراده أبدًا داخل أي component يعمل على المتصفح (Client Component)
// الفرونت إند لا يجب أن يرى هذه الأرقام إطلاقًا — فقط النتيجة النهائية المحسوبة
// ============================================================

// أقل عدد أفراد مسموح به للحجز — مصدره الوحيد data/booking.ts
export { MIN_PEOPLE } from "@/data/booking";

export function isValidAddonKey(key: string): key is AddonKey {
  return ADDON_OPTIONS.some((opt) => opt.key === key);
}

export type ProgramPricing = {
  breakfastPerPerson: number;
  lunchPerPerson: number;
  ticketsPerPerson: number;
  carPrice: number; // سعر السيارة الواحدة (تستوعب peoplePerCar أفراد)
};

type ProgramPricingRow = {
  program_id: string;
  breakfast_per_person: number;
  lunch_per_person: number;
  tickets_per_person: number;
  car_price: number;
};

function rowToProgramPricing(row: ProgramPricingRow): ProgramPricing {
  return {
    breakfastPerPerson: Number(row.breakfast_per_person),
    lunchPerPerson: Number(row.lunch_per_person),
    ticketsPerPerson: Number(row.tickets_per_person),
    carPrice: Number(row.car_price),
  };
}

export async function getProgramPricing(programId: string): Promise<ProgramPricing | null> {
  const result = await pool.query<ProgramPricingRow>(
    "SELECT * FROM program_pricing WHERE program_id = $1",
    [programId]
  );
  return result.rows[0] ? rowToProgramPricing(result.rows[0]) : null;
}

export async function listProgramPricing(): Promise<Record<string, ProgramPricing>> {
  const result = await pool.query<ProgramPricingRow>("SELECT * FROM program_pricing");
  return Object.fromEntries(result.rows.map((row) => [row.program_id, rowToProgramPricing(row)]));
}

export async function setProgramPricing(programId: string, pricing: ProgramPricing): Promise<void> {
  await pool.query(
    `INSERT INTO program_pricing (program_id, breakfast_per_person, lunch_per_person, tickets_per_person, car_price)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (program_id) DO UPDATE SET
       breakfast_per_person = EXCLUDED.breakfast_per_person,
       lunch_per_person = EXCLUDED.lunch_per_person,
       tickets_per_person = EXCLUDED.tickets_per_person,
       car_price = EXCLUDED.car_price`,
    [programId, pricing.breakfastPerPerson, pricing.lunchPerPerson, pricing.ticketsPerPerson, pricing.carPrice]
  );
}

export async function getAddonPrices(): Promise<Record<string, number>> {
  const result = await pool.query<{ key: string; price: number }>("SELECT * FROM addon_prices");
  return Object.fromEntries(result.rows.map((row) => [row.key, Number(row.price)]));
}

export async function setAddonPrice(key: string, price: number): Promise<void> {
  await pool.query(
    `INSERT INTO addon_prices (key, price) VALUES ($1,$2)
     ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price`,
    [key, price]
  );
}

export type MarginTier = { minPeople: number; margin: number };
export type PricingSettings = { peoplePerCar: number; marginTiers: MarginTier[] };

const DEFAULT_SETTINGS: PricingSettings = {
  peoplePerCar: 6,
  marginTiers: [
    { minPeople: 32, margin: 15000 },
    { minPeople: 26, margin: 10000 },
    { minPeople: 20, margin: 7000 },
  ],
};

export async function getPricingSettings(): Promise<PricingSettings> {
  const result = await pool.query<{ people_per_car: number; margin_tiers: MarginTier[] }>(
    "SELECT * FROM pricing_settings WHERE id = 1"
  );
  if (!result.rows[0]) return DEFAULT_SETTINGS;
  return {
    peoplePerCar: result.rows[0].people_per_car,
    marginTiers: result.rows[0].margin_tiers ?? [],
  };
}

export async function setPricingSettings(settings: PricingSettings): Promise<void> {
  await pool.query(
    `INSERT INTO pricing_settings (id, people_per_car, margin_tiers) VALUES (1,$1,$2)
     ON CONFLICT (id) DO UPDATE SET people_per_car = EXCLUDED.people_per_car, margin_tiers = EXCLUDED.margin_tiers`,
    [settings.peoplePerCar, JSON.stringify(settings.marginTiers)]
  );
}

function getProfitMargin(people: number, tiers: MarginTier[]): number {
  const sorted = [...tiers].sort((a, b) => b.minPeople - a.minPeople);
  for (const tier of sorted) {
    if (people >= tier.minPeople) return tier.margin;
  }
  return 0;
}

export type CalculatePriceInput = {
  programId: string;
  people: number;
  addons: AddonKey[];
};

export type CalculatePriceResult =
  | {
      ok: true;
      pricePerPerson: number;
      total: number;
    }
  | {
      ok: false;
      error: string;
    };

export async function calculatePrice({
  programId,
  people,
  addons,
}: CalculatePriceInput): Promise<CalculatePriceResult> {
  const pricing = await getProgramPricing(programId);
  if (!pricing) {
    return { ok: false, error: "برنامج الرحلة غير موجود" };
  }

  if (!Number.isInteger(people) || people <= 0) {
    return { ok: false, error: "عدد الأفراد يجب أن يكون رقمًا صحيحًا موجبًا" };
  }

  if (people < MIN_PEOPLE) {
    return { ok: false, error: `الحد الأدنى للحجز ${MIN_PEOPLE} فرد` };
  }

  const [settings, addonPrices] = await Promise.all([getPricingSettings(), getAddonPrices()]);

  const mealsAndTicketsPerPerson =
    pricing.breakfastPerPerson + pricing.lunchPerPerson + pricing.ticketsPerPerson;

  const carsNeeded = Math.ceil(people / settings.peoplePerCar);
  const carsCost = carsNeeded * pricing.carPrice;

  const addonsCost = addons.reduce((sum, key) => sum + (addonPrices[key] ?? 0), 0);

  const profitMargin = getProfitMargin(people, settings.marginTiers);

  const total = mealsAndTicketsPerPerson * people + carsCost + addonsCost + profitMargin;

  const pricePerPerson = Math.ceil(total / people);

  return {
    ok: true,
    pricePerPerson,
    total: Math.ceil(total),
  };
}
