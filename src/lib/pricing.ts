import "server-only";
import { pool } from "@/lib/db";
import { ADDON_OPTIONS, type AddonKey } from "@/data/addons";
import { MIN_PEOPLE } from "@/data/booking";
import { allocateFleet, type Vehicle } from "@/lib/transport";

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
  carPrice: number; // (قديم) سعر السيارة الواحدة — بيتستخدم لو مفيش مركبات متسجلة
  // أنهي مجموعة مركبات البرنامج بيستخدمها: safari (عربية 6 أفراد) أو bus (باصات حسب العدد)
  transportGroup: string;
};

type ProgramPricingRow = {
  program_id: string;
  breakfast_per_person: number;
  lunch_per_person: number;
  tickets_per_person: number;
  car_price: number;
  transport_group: string | null;
};

function rowToProgramPricing(row: ProgramPricingRow): ProgramPricing {
  return {
    breakfastPerPerson: Number(row.breakfast_per_person),
    lunchPerPerson: Number(row.lunch_per_person),
    ticketsPerPerson: Number(row.tickets_per_person),
    carPrice: Number(row.car_price),
    transportGroup: row.transport_group ?? "safari",
  };
}

type VehicleRow = {
  id: string;
  name: string;
  name_en: string;
  capacity: number;
  price: number;
};

// مركبات مجموعة معينة (سفاري/باصات) مرتبة
export async function listVehicles(group: string): Promise<Vehicle[]> {
  const result = await pool.query<VehicleRow>(
    "SELECT id, name, name_en, capacity, price FROM transport_vehicles WHERE vehicle_group=$1 AND active=true ORDER BY capacity ASC",
    [group]
  );
  return result.rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameEn: r.name_en,
    capacity: r.capacity,
    price: Number(r.price),
  }));
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
    `INSERT INTO program_pricing (program_id, breakfast_per_person, lunch_per_person, tickets_per_person, car_price, transport_group)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (program_id) DO UPDATE SET
       breakfast_per_person = EXCLUDED.breakfast_per_person,
       lunch_per_person = EXCLUDED.lunch_per_person,
       tickets_per_person = EXCLUDED.tickets_per_person,
       car_price = EXCLUDED.car_price,
       transport_group = EXCLUDED.transport_group`,
    [
      programId,
      pricing.breakfastPerPerson,
      pricing.lunchPerPerson,
      pricing.ticketsPerPerson,
      pricing.carPrice,
      pricing.transportGroup || "safari",
    ]
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

// شريحة هامش الربح: من عدد كذا لعدد كذا → المبلغ المضاف
// toPeople = 0 معناها "وما فوق" (مفيش حد أقصى)
export type MarginTier = { fromPeople: number; toPeople: number; margin: number };
export type PricingSettings = { peoplePerCar: number; marginTiers: MarginTier[] };

const DEFAULT_SETTINGS: PricingSettings = {
  peoplePerCar: 6,
  marginTiers: [
    { fromPeople: 20, toPeople: 25, margin: 7000 },
    { fromPeople: 26, toPeople: 31, margin: 10000 },
    { fromPeople: 32, toPeople: 0, margin: 15000 },
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
  for (const tier of tiers) {
    const aboveMin = people >= tier.fromPeople;
    const belowMax = tier.toPeople <= 0 || people <= tier.toPeople;
    if (aboveMin && belowMax) return tier.margin;
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

  // تكلفة الانتقالات: بتتحسب من المركبات المسجلة حسب مجموعة البرنامج
  // (السفاري عربية 6 أفراد بسعر ثابت، والباصات نوعها بيتحدد حسب العدد)
  const vehicles = await listVehicles(pricing.transportGroup || "safari");
  const carsCost =
    vehicles.length > 0
      ? allocateFleet(people, vehicles).total
      : Math.ceil(people / settings.peoplePerCar) * pricing.carPrice;

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
