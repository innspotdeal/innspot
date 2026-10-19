import type { ItineraryStep } from "@/data/programs";

// كل سطر عنصر مستقل (للقوائم زي "يشمل البرنامج")
export function toList(value: unknown): string[] {
  return typeof value === "string"
    ? value.split("\n").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
}

// الصور مفصولة بفاصلة مش بسطر جديد
export function toImageList(value: unknown): string[] {
  return typeof value === "string"
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
}

// مخطط الرحلة: كل سطر خطوة، والتفصيل بعد علامة | (اختياري)
// مثال: الإفطار في واحة الزواوي | فطير مشلتت + عسل + جبنة
export function toItinerary(value: unknown, valueEn: unknown): ItineraryStep[] {
  const ar = toList(value);
  const en = toList(valueEn);

  return ar.map((line, i) => {
    const [title, ...detailParts] = line.split("|");
    const [titleEn, ...detailPartsEn] = (en[i] ?? "").split("|");
    return {
      title: title.trim(),
      titleEn: (titleEn ?? "").trim(),
      detail: detailParts.join("|").trim(),
      detailEn: detailPartsEn.join("|").trim(),
    };
  });
}

// سعر التذكرة: رقم مش سالب — أي حاجة تانية (فاضي/نص) = صفر، يعني مش برنامج تذاكر
export function toTicketPrice(value: unknown): number {
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// أقل عدد أفراد للحجز: رقم صحيح من 1 لـ 1000 — أي حاجة تانية = null (غلط)
export function toMinPeople(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : null;
}
