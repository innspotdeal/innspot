// ============================================================
// قائمة الإضافات المتاحة لرحلات الشركات (بدون أسعار)
// هذا الملف آمن للاستخدام في الفرونت إند (Client Components)
// الأسعار الفعلية لهذه الإضافات موجودة فقط في lib/pricing.ts على السيرفر
// عدّل هنا فقط الاسم الظاهر للمستخدم أو أضف/احذف إضافة جديدة
// (لو أضفت إضافة جديدة هنا، لا تنسَ إضافة سعرها في lib/pricing.ts أيضًا)
// ============================================================

export const ADDON_OPTIONS = [
  { key: "bedouinBand", label: "فرقة بدوي", labelEn: "Bedouin Band" },
  { key: "fireShow", label: "فاير شو", labelEn: "Fire Show" },
  { key: "mizmarReception", label: "مزمار بلدي للاستقبال", labelEn: "Mizmar Reception" },
] as const;

export type AddonKey = (typeof ADDON_OPTIONS)[number]["key"];
