import "server-only";
import { pool } from "@/lib/db";
import { MIN_PEOPLE } from "@/data/booking";
import { allocateFleet, type Vehicle } from "@/lib/transport";
import { addonTotal, getProgramAddons } from "@/lib/program-addons";

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

export type ProgramPricing = {
  breakfastPerPerson: number;
  lunchPerPerson: number;
  ticketsPerPerson: number;
  carPrice: number; // (قديم) سعر السيارة الواحدة — بيتستخدم لو مفيش مركبات متسجلة
  // (قديم) الاختيار الواحد — اتقسم لـ needsBus و needsSafari
  transportGroup: string;
  // البرنامج محتاج باص يوصّل المجموعة؟ (ده اللي العميل يقدر يشيله لو جاي بمواصلاته)
  needsBus: boolean;
  // البرنامج فيه جزء سفاري محتاج عربيات دفع رباعي؟ (جزء من الرحلة نفسها)
  needsSafari: boolean;
};

type ProgramPricingRow = {
  program_id: string;
  breakfast_per_person: number;
  lunch_per_person: number;
  tickets_per_person: number;
  car_price: number;
  transport_group: string | null;
  needs_bus: boolean | null;
  needs_safari: boolean | null;
};

function rowToProgramPricing(row: ProgramPricingRow): ProgramPricing {
  return {
    breakfastPerPerson: Number(row.breakfast_per_person),
    lunchPerPerson: Number(row.lunch_per_person),
    ticketsPerPerson: Number(row.tickets_per_person),
    carPrice: Number(row.car_price),
    transportGroup: row.transport_group ?? "safari",
    needsBus: row.needs_bus ?? true,
    needsSafari: row.needs_safari ?? row.transport_group === "safari",
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

// بند بيتسعّر حسب عدد الأفراد
export const TIER_KINDS = ["breakfast", "lunch", "tickets"] as const;
export type TierKind = (typeof TIER_KINDS)[number];

export type PriceTier = {
  kind: TierKind;
  fromPeople: number;
  toPeople: number; // 0 = وما فوق
  price: number;
};

type TierRow = {
  kind: TierKind;
  from_people: number;
  to_people: number;
  price: number;
};

export async function listProgramTiers(programId: string): Promise<PriceTier[]> {
  const result = await pool.query<TierRow>(
    "SELECT kind, from_people, to_people, price FROM program_price_tiers WHERE program_id=$1 ORDER BY kind, from_people",
    [programId]
  );
  return result.rows.map((r) => ({
    kind: r.kind,
    fromPeople: r.from_people,
    toPeople: r.to_people,
    price: Number(r.price),
  }));
}

export async function listAllProgramTiers(): Promise<Record<string, PriceTier[]>> {
  const result = await pool.query<TierRow & { program_id: string }>(
    "SELECT program_id, kind, from_people, to_people, price FROM program_price_tiers ORDER BY program_id, kind, from_people"
  );
  const map: Record<string, PriceTier[]> = {};
  for (const r of result.rows) {
    (map[r.program_id] ??= []).push({
      kind: r.kind,
      fromPeople: r.from_people,
      toPeople: r.to_people,
      price: Number(r.price),
    });
  }
  return map;
}

export async function setProgramTiers(programId: string, tiers: PriceTier[]): Promise<void> {
  await pool.query("DELETE FROM program_price_tiers WHERE program_id=$1", [programId]);
  for (const t of tiers) {
    await pool.query(
      `INSERT INTO program_price_tiers (program_id, kind, from_people, to_people, price)
       VALUES ($1,$2,$3,$4,$5)`,
      [programId, t.kind, t.fromPeople, t.toPeople, t.price]
    );
  }
}

// سعر البند للعدد ده — أول شريحة العدد واقع جواها
function priceForPeople(tiers: PriceTier[], kind: TierKind, people: number): number {
  const match = tiers.find(
    (t) => t.kind === kind && people >= t.fromPeople && (t.toPeople <= 0 || people <= t.toPeople)
  );
  return match ? match.price : 0;
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
    `INSERT INTO program_pricing (program_id, breakfast_per_person, lunch_per_person, tickets_per_person, car_price, transport_group, needs_bus, needs_safari)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (program_id) DO UPDATE SET
       breakfast_per_person = EXCLUDED.breakfast_per_person,
       lunch_per_person = EXCLUDED.lunch_per_person,
       tickets_per_person = EXCLUDED.tickets_per_person,
       car_price = EXCLUDED.car_price,
       transport_group = EXCLUDED.transport_group,
       needs_bus = EXCLUDED.needs_bus,
       needs_safari = EXCLUDED.needs_safari`,
    [
      programId,
      pricing.breakfastPerPerson,
      pricing.lunchPerPerson,
      pricing.ticketsPerPerson,
      pricing.carPrice,
      pricing.transportGroup || "safari",
      pricing.needsBus,
      pricing.needsSafari,
    ]
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
  // معرّفات الإضافات اللي العميل اختارها — أي حاجة مش متاحة للبرنامج بتتجاهل
  addons: string[];
  // الانتقالات اختيارية — العميل ممكن ييجي بمواصلاته
  includeTransport?: boolean;
};

export type CalculatePriceResult =
  | {
      ok: true;
      pricePerPerson: number;
      total: number;
      // أسماء الإضافات اللي اتحسبت فعلًا (المشمولة + المختارة)
      includedAddons: { name: string; nameEn: string }[];
      selectedAddons: { name: string; nameEn: string }[];
    }
  | {
      ok: false;
      error: string;
    };

export async function calculatePrice({
  programId,
  people,
  addons,
  includeTransport = true,
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

  const [settings, programAddons] = await Promise.all([
    getPricingSettings(),
    getProgramAddons(programId),
  ]);

  // الأسعار بتتاخد من الشرائح حسب العدد، ولو مفيش شرائح بنرجع للسعر الثابت القديم
  const tiers = await listProgramTiers(programId);
  const mealsAndTicketsPerPerson = tiers.length
    ? priceForPeople(tiers, "breakfast", people) +
      priceForPeople(tiers, "lunch", people) +
      priceForPeople(tiers, "tickets", people)
    : pricing.breakfastPerPerson + pricing.lunchPerPerson + pricing.ticketsPerPerson;

  // تكلفة الانتقالات: بتتحسب من المركبات المسجلة حسب مجموعة البرنامج
  // (السفاري عربية 6 أفراد بسعر ثابت، والباصات نوعها بيتحدد حسب العدد)
  // الباص والسفاري منفصلين تمامًا — رحلة السفاري محتاجة الاتنين:
  // باص يوصّلهم الفيوم، وعربيات دفع رباعي للصحراء
  let carsCost = 0;

  // الباص بس هو اللي العميل يقدر يشيله (لو جاي بمواصلاته)
  if (pricing.needsBus && includeTransport) {
    const busVehicles = await listVehicles("bus");
    carsCost += busVehicles.length
      ? allocateFleet(people, busVehicles).total
      : Math.ceil(people / settings.peoplePerCar) * pricing.carPrice;
  }

  // عربيات السفاري جزء من الرحلة نفسها، مش اختيارية
  if (pricing.needsSafari) {
    const safariVehicles = await listVehicles("safari");
    carsCost += safariVehicles.length ? allocateFleet(people, safariVehicles).total : 0;
  }

  // المشمولة بتتحسب دايمًا، والمختارة بس لو متاحة فعلًا في البرنامج ده
  const chosen = programAddons.available.filter((o) => addons.includes(o.id));
  const addonsCost = [...programAddons.included, ...chosen].reduce(
    (sum, option) => sum + addonTotal(option, people),
    0
  );

  const profitMargin = getProfitMargin(people, settings.marginTiers);

  const total = mealsAndTicketsPerPerson * people + carsCost + addonsCost + profitMargin;

  const pricePerPerson = Math.ceil(total / people);

  const names = (o: { name: string; nameEn: string }) => ({ name: o.name, nameEn: o.nameEn });

  return {
    ok: true,
    pricePerPerson,
    total: Math.ceil(total),
    includedAddons: programAddons.included.map(names),
    selectedAddons: chosen.map(names),
  };
}

// أقل سعر ممكن للفرد في البرنامج — بنجرب كل الأعداد من الحد الأدنى لحد MAX
// وناخد أرخص نتيجة (السعر بيقل مع زيادة العدد لكن شرائح الربح بتزوّده، فالأقل
// مش دايمًا عند أكبر عدد)
const STARTING_PRICE_MAX_PEOPLE = 50;

export async function getStartingPricePerPerson(programId: string): Promise<number | null> {
  let cheapest: number | null = null;

  for (let people = MIN_PEOPLE; people <= STARTING_PRICE_MAX_PEOPLE; people++) {
    const result = await calculatePrice({ programId, people, addons: [] });
    if (!result.ok) continue;
    if (cheapest === null || result.pricePerPerson < cheapest) cheapest = result.pricePerPerson;
  }

  return cheapest;
}

// نفس الحاجة لكل البرامج مرة واحدة
export async function getStartingPrices(programIds: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(
    programIds.map(async (id) => [id, await getStartingPricePerPerson(id)] as const)
  );
  return Object.fromEntries(entries.filter(([, price]) => price !== null)) as Record<string, number>;
}
