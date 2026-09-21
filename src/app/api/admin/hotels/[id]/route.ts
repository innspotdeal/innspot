import { NextResponse } from "next/server";
import { deleteHotel, updateHotel, type HotelUpdateInput } from "@/lib/hotels-repo";
import { parseRoomTypes } from "@/lib/room-types";

function toList(value: unknown): string[] {
  return typeof value === "string"
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
}

function parseUpdateInput(
  body: unknown
): { ok: true; update: HotelUpdateInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const update: HotelUpdateInput = {};

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (b.images !== undefined) update.images = toList(b.images);
  if (b.roomTypes !== undefined) {
    const rooms = parseRoomTypes(b.roomTypes);
    if (!rooms.ok) return rooms;
    update.roomTypes = rooms.rooms;
  }
  if (b.amenities !== undefined) update.amenities = toList(b.amenities);
  if (b.amenitiesEn !== undefined) update.amenitiesEn = toList(b.amenitiesEn);
  if (b.hasPool !== undefined) update.hasPool = Boolean(b.hasPool);
  if (b.hasGarden !== undefined) update.hasGarden = Boolean(b.hasGarden);

  return { ok: true, update };
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = parseUpdateInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const hotel = await updateHotel(id, parsed.update);
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
