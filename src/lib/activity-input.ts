import type { Activity } from "@/data/activities";
import { toList } from "@/lib/program-input";

export type ActivityDetails = Partial<
  Pick<Activity, "price" | "duration" | "durationEn" | "includes" | "includesEn">
>;

// سعر النشاط ومدته و"يشمل النشاط" — جايين من لوحة الأدمن أو الـ ERP
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

  return { ok: true, data };
}
