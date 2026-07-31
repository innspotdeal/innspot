// يحدد أيقونة Flaticon المناسبة لنص مرفق معيّن بناءً على كلمات مفتاحية (عربي/إنجليزي)
// الترتيب مهم: مثلاً "حمام سباحة" لازم تتطابق مع أيقونة المسبح قبل ما توصل لقاعدة "حمام"
const ICON_RULES: { keywords: string[]; icon: string }[] = [
  { keywords: ["مسبح", "سباح", "بيسين", "pool"], icon: "fi fi-br-water-ladder" },
  { keywords: ["حديق", "جاردن", "garden"], icon: "fi fi-rr-daisy-alt" },
  { keywords: ["مكيف", "تكييف", "air condition", "a/c", "central a/c"], icon: "fi fi-rr-air-conditioner" },
  { keywords: ["حمام", "bathroom", "bath"], icon: "fi fi-ss-bath" },
  { keywords: ["مطبخ", "kitchen"], icon: "fi fi-rs-kitchen-set" },
  { keywords: ["باركنج", "جراج", "موقف", "parking", "garage"], icon: "fi fi-rs-parking" },
];

export function getAmenityIconClass(text: string): string | null {
  const lower = text.toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      return rule.icon;
    }
  }
  return null;
}
