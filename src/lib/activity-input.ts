import type { Activity } from "@/data/activities";
import { toList } from "@/lib/program-input";

export type ActivityDetails = Partial<
  Pick<Activity, "image" | "images" | "price" | "duration" | "durationEn" | "includes" | "includesEn">
>;

// حد معقول عشان صفحة النشاط متتقلش (زي صور الغرف)
const MAX_ACTIVITY_IMAGES = 12;

// سعر النشاط ومدته و"يشمل النشاط" — جايين من الـ ERP
// اللي مش مبعوت بيفضل undefined، عشان الـ PATCH الجزئي ما يمسحوش
// السعر: فاضي = صفر (من غير سعر)، ورقم سالب أو نص = غلط
export function parseActivityDetails(
  b: Record<string, unknown>
): { ok: true; data: ActivityDetails } | { ok: false; error: string } {
  const data: ActivityDetails = {};

  if (b.price !== undefined) {
    const price = b.price === "" || b.price === null ? 0 : Number(b.price);
    if (typeof b.price === "boolean" || !Number.isFinite(price) || price < 0) {
      return { ok: false, error: "سعر النشاط لازم يكون رقم مش سالب" };
    }
    data.price = price;
  }
  if (typeof b.duration === "string") data.duration = b.duration.trim();
  if (typeof b.durationEn === "string") data.durationEn = b.durationEn.trim();
  if (b.includes !== undefined) data.includes = toList(b.includes);
  if (b.includesEn !== undefined) data.includesEn = toList(b.includesEn);

  // صور النشاط: الأولى هي الغلاف اللي الكروت بتعرضه (image)
  if (b.images !== undefined) {
    if (!Array.isArray(b.images)) return { ok: false, error: "صور النشاط لازم تكون قايمة" };
    const images = b.images
      .filter((v): v is string => typeof v === "string" && v.trim() !== "")
      .map((v) => v.trim());
    if (images.length > MAX_ACTIVITY_IMAGES) {
      return { ok: false, error: `أقصى عدد صور للنشاط ${MAX_ACTIVITY_IMAGES}` };
    }
    data.images = images;
    data.image = images[0] ?? "";
  }

  return { ok: true, data };
}
