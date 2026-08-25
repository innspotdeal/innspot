import { NextResponse } from "next/server";
import { deleteHotel, updateHotel, type HotelUpdateInput, type HotelInput } from "@/lib/hotels-repo";

function toList(value: unknown): string[] {
  return typeof value === "string"
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
}

function toRoomTypes(value: unknown): HotelInput["roomTypes"] {
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

function parseUpdateInput(body: unknown): HotelUpdateInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const update: HotelUpdateInput = {};

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (b.images !== undefined) update.images = toList(b.images);
  if (b.roomTypes !== undefined) update.roomTypes = toRoomTypes(b.roomTypes);
  if (b.amenities !== undefined) update.amenities = toList(b.amenities);
  if (b.amenitiesEn !== undefined) update.amenitiesEn = toList(b.amenitiesEn);
  if (b.hasPool !== undefined) update.hasPool = Boolean(b.hasPool);
  if (b.hasGarden !== undefined) update.hasGarden = Boolean(b.hasGarden);

  return update;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const hotel = await updateHotel(id, parseUpdateInput(body));
  if (!hotel) {
    return NextResponse.json({ ok: false, error: "الفندق غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, hotel });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await deleteHotel(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "الفندق غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
