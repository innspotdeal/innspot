import { NextResponse } from "next/server";
import { createHotel, listHotels, type HotelInput } from "@/lib/hotels-repo";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toList(value: unknown): string[] {
  return typeof value === "string"
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
}

function toRoomTypes(value: unknown): HotelInput["roomTypes"] {
  // شكل الإدخال المتوقع من الفورم: أسطر، كل سطر "اسم عربي,اسم إنجليزي,السعة"
  if (Array.isArray(value)) return value as HotelInput["roomTypes"];
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, nameEn, capacity] = line.split(",").map((s) => s.trim());
      return { name: name ?? "", nameEn: nameEn ?? "", capacity: Number(capacity) || 1 };
    });
}

function parseHotelInput(body: unknown): { ok: true; data: HotelInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const nameEn = typeof b.nameEn === "string" ? b.nameEn.trim() : "";
  if (!name || !nameEn) {
    return { ok: false, error: "اسم الفندق (عربي وإنجليزي) مطلوب" };
  }

  const rawId = typeof b.id === "string" && b.id.trim() ? b.id.trim() : slugify(nameEn || name);
  const id = slugify(rawId);
  if (!id) return { ok: false, error: "تعذر تكوين معرّف صالح للفندق" };

  return {
    ok: true,
    data: {
      id,
      name,
      nameEn,
      description: typeof b.description === "string" ? b.description.trim() : "",
      descriptionEn: typeof b.descriptionEn === "string" ? b.descriptionEn.trim() : "",
      images: toList(b.images),
      roomTypes: toRoomTypes(b.roomTypes),
      hasPool: Boolean(b.hasPool),
      hasGarden: Boolean(b.hasGarden),
      amenities: toList(b.amenities),
      amenitiesEn: toList(b.amenitiesEn),
    },
  };
}

export async function GET() {
  const hotels = await listHotels();
  return NextResponse.json({ ok: true, hotels });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = parseHotelInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const hotel = await createHotel(parsed.data);
    return NextResponse.json({ ok: true, hotel }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("duplicate key")
        ? "فندق بنفس المعرّف موجود بالفعل"
        : "حدث خطأ أثناء إضافة الفندق";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
