import "server-only";
import { ADDON_OPTIONS, type AddonKey } from "@/data/addons";
import { MIN_PEOPLE } from "@/data/booking";

// ============================================================
// ملف التسعير — سيرفر فقط (Server Only)
// ============================================================
// تحذير مهم جدًا: هذا الملف يحتوي على كل أسعار الشركة الداخلية
// (تكلفة الفرد، تكلفة السيارات، هامش الربح...)
// هذا الملف يُستخدم فقط داخل API Routes على السيرفر
// يجب ألا يتم استيراده أبدًا داخل أي component يعمل على المتصفح (Client Component)
// الفرونت إند لا يجب أن يرى هذه الأرقام إطلاقًا — فقط النتيجة النهائية المحسوبة
// ============================================================

// أقل عدد أفراد مسموح به للحجز — مصدره الوحيد data/booking.ts
// (بيتعاد تصديره هنا عشان الكود اللي بيستورده من lib/pricing يفضل شغال)
export { MIN_PEOPLE } from "@/data/booking";

// عدد الأفراد الذي تستوعبه كل سيارة سفاري واحدة
const PEOPLE_PER_CAR = 6;

// أسعار الإضافات (ثابتة/فلات، تُجمع في حالة اختيار أكثر من إضافة)
// المفاتيح هنا يجب أن تطابق نفس المفاتيح الموجودة في src/data/addons.ts
const ADDON_PRICES: Record<AddonKey, number> = {
  bedouinBand: 3500,
  fireShow: 3000,
  mizmarReception: 1500,
};

export function isValidAddonKey(key: string): key is AddonKey {
  return ADDON_OPTIONS.some((opt) => opt.key === key);
}

// إعدادات التسعير الخاصة بكل برنامج رحلة على حدة
// كل برنامج له نفس الهيكل، ويمكن تعديل أرقام أي برنامج دون التأثير على الباقي
type ProgramPricing = {
  breakfastPerPerson: number;
  lunchPerPerson: number;
  ticketsPerPerson: number;
  carPrice: number; // سعر السيارة الواحدة (تستوعب PEOPLE_PER_CAR أفراد)
};

// ملاحظة: كل الأسعار دي نفس أسعار السفاري مؤقتًا (placeholder) لحين تزويدنا بالأسعار الفعلية لكل برنامج
export const PROGRAM_PRICING: Record<string, ProgramPricing> = {
  "innspot-classic": {
    breakfastPerPerson: 75,
    lunchPerPerson: 150,
    ticketsPerPerson: 25,
    carPrice: 3000,
  },
  "advance-program": {
    breakfastPerPerson: 75,
    lunchPerPerson: 150,
    ticketsPerPerson: 25,
    carPrice: 3000,
  },
  "classic-safari": {
    breakfastPerPerson: 75,
    lunchPerPerson: 150,
    ticketsPerPerson: 25,
    carPrice: 3000,
  },
  "advance-safari": {
    breakfastPerPerson: 75,
    lunchPerPerson: 150,
    ticketsPerPerson: 25,
    carPrice: 3000,
  },
};

// هامش الربح المُضاف حسب عدد الأفراد (شرائح)
function getProfitMargin(people: number): number {
  if (people >= 32) return 15000;
  if (people >= 26) return 10000;
  if (people >= 20) return 7000;
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

export function calculatePrice({
  programId,
  people,
  addons,
}: CalculatePriceInput): CalculatePriceResult {
  const pricing = PROGRAM_PRICING[programId];
  if (!pricing) {
    return { ok: false, error: "برنامج الرحلة غير موجود" };
  }

  if (!Number.isInteger(people) || people <= 0) {
    return { ok: false, error: "عدد الأفراد يجب أن يكون رقمًا صحيحًا موجبًا" };
  }

  if (people < MIN_PEOPLE) {
    return { ok: false, error: `الحد الأدنى للحجز ${MIN_PEOPLE} فرد` };
  }

  const mealsAndTicketsPerPerson =
    pricing.breakfastPerPerson + pricing.lunchPerPerson + pricing.ticketsPerPerson;

  const carsNeeded = Math.ceil(people / PEOPLE_PER_CAR);
  const carsCost = carsNeeded * pricing.carPrice;

  const addonsCost = addons.reduce((sum, key) => sum + (ADDON_PRICES[key] ?? 0), 0);

  const profitMargin = getProfitMargin(people);

  const total =
    mealsAndTicketsPerPerson * people + carsCost + addonsCost + profitMargin;

  const pricePerPerson = Math.ceil(total / people);

  return {
    ok: true,
    pricePerPerson,
    total: Math.ceil(total),
  };
}
