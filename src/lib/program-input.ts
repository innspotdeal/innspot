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

// العكس: من مخطط الرحلة لنص قابل للتعديل في لوحة الأدمن
export function itineraryToText(steps: ItineraryStep[], lang: "ar" | "en"): string {
  return steps
    .map((s) => {
      const title = lang === "en" ? s.titleEn : s.title;
      const detail = lang === "en" ? s.detailEn : s.detail;
      return detail ? `${title} | ${detail}` : title;
    })
    .join("\n");
}
