// ============================================================
// كتالوج البرنامج المخصّص (Custom Program)
// العميل بيركّب رحلته بنفسه: مبيت/داي يوز → فطار → سفاري → غدا → إضافات
// كل الخيارات وأسعارها متخزنة في جدول custom_trip_options ومتعدَّلة
// من لوحة الأدمن على /admin/custom-trip
// ============================================================

// نوع الخيار — بيحدد في أنهي خطوة يظهر
export const OPTION_KINDS = [
  "hotel", // فندق/مكان مبيت
  "breakfast_place", // مكان الفطار
  "breakfast_item", // صنف فطار (تابع لمكان)
  "lunch_place", // مكان الغداء
  "lunch_item", // صنف غداء (تابع لمكان)
  "safari_car", // نوع عربية السفاري (بسعتها)
  "addon", // إضافات: سناكس، فاكهة، فرقة بدوي، فاير شو، تنورة، وادي الحيتان
] as const;

export type OptionKind = (typeof OPTION_KINDS)[number];

export const KIND_LABELS: Record<OptionKind, string> = {
  hotel: "أماكن المبيت",
  breakfast_place: "أماكن الفطار",
  breakfast_item: "أصناف الفطار",
  lunch_place: "أماكن الغداء",
  lunch_item: "أصناف الغداء",
  safari_car: "عربيات السفاري",
  addon: "الإضافات",
};

// أساس حساب السعر
export const PRICE_UNITS = ["per_person", "per_car", "per_night", "flat"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  per_person: "للفرد",
  per_car: "للعربية",
  per_night: "للفرد/الليلة",
  flat: "سعر ثابت",
};

export type CustomTripOption = {
  id: string;
  kind: OptionKind;
  // للأصناف: معرّف المكان اللي الصنف تابع له
  parentId: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  priceUnit: PriceUnit;
  // لعربيات السفاري: كام فرد في العربية
  capacity: number;
  // مستوى المكان/الفندق (مثال: 3 نجوم، فاخر، اقتصادي)
  tier: string;
  // للفنادق: السعر شامل فطار ولا لأ
  includesBreakfast: boolean;
  image: string;
  // متاح للاختيار ولا مخفي مؤقتًا
  active: boolean;
  sortOrder: number;
};
