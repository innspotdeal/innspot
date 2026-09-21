import type { RoomType } from "@/data/hotels";

// ============================================================
// غرف الفندق — التحقق والتنضيف
// الغرف متخزنة JSONB جوه جدول hotels، فالصفوف القديمة ممكن يكون ناقصها
// الوصف أو السعر — القراءة بتكمّلهم بقيم افتراضية بدل ما الصفحة تقع
// ============================================================

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const urls = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim())
    : [];

// حد معقول عشان صفحة الفندق متتقلش
const MAX_ROOM_IMAGES = 12;

const number = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// قراءة متسامحة — للبيانات اللي جاية من قاعدة البيانات
export function readRoomTypes(value: unknown): RoomType[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .map((r) => ({
      name: text(r.name),
      nameEn: text(r.nameEn),
      description: text(r.description),
      descriptionEn: text(r.descriptionEn),
      capacity: Math.max(1, Math.round(number(r.capacity)) || 1),
      price: Math.max(0, number(r.price)),
      images: urls(r.images),
    }))
    .filter((r) => r.name);
}

// تحقق صارم — للبيانات اللي جاية من لوحة الأدمن أو الـ ERP
export function parseRoomTypes(
  value: unknown
): { ok: true; rooms: RoomType[] } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, rooms: [] };
  if (!Array.isArray(value)) return { ok: false, error: "الغرف لازم تكون قايمة" };

  const rooms: RoomType[] = [];
  for (const [index, raw] of value.entries()) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const label = `الغرفة رقم ${index + 1}`;

    const name = text(r.name);
    if (!name) return { ok: false, error: `${label}: الاسم مطلوب` };

    const capacity = Number(r.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
      return { ok: false, error: `${label} (${name}): السعة لازم تكون رقم صحيح من 1 لـ 50` };
    }

    const price = r.price === undefined || r.price === "" ? 0 : Number(r.price);
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: `${label} (${name}): السعر لازم يكون رقم مش سالب` };
    }

    const images = urls(r.images);
    if (images.length > MAX_ROOM_IMAGES) {
      return { ok: false, error: `${label} (${name}): أقصى عدد صور ${MAX_ROOM_IMAGES}` };
    }

    rooms.push({
      name,
      nameEn: text(r.nameEn),
      description: text(r.description),
      descriptionEn: text(r.descriptionEn),
      capacity,
      price,
      images,
    });
  }
  return { ok: true, rooms };
}
