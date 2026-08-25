import { NextResponse } from "next/server";
import { deleteVilla, updateVilla, type VillaUpdateInput } from "@/lib/villas-repo";

function parseUpdateInput(body: unknown): VillaUpdateInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const update: VillaUpdateInput = {};

  const toList = (value: unknown): string[] =>
    typeof value === "string"
      ? value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string")
        : [];

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (b.images !== undefined) update.images = toList(b.images);
  if (b.amenities !== undefined) update.amenities = toList(b.amenities);
  if (b.amenitiesEn !== undefined) update.amenitiesEn = toList(b.amenitiesEn);
  if (b.rooms !== undefined) update.rooms = Number(b.rooms) || 0;
  if (b.beds !== undefined) update.beds = Number(b.beds) || 0;
  if (b.capacity !== undefined) update.capacity = Number(b.capacity) || 0;
  if (b.priceWeekday !== undefined) update.priceWeekday = Number(b.priceWeekday) || 0;
  if (b.priceWeekend !== undefined) update.priceWeekend = Number(b.priceWeekend) || 0;
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

  const update = parseUpdateInput(body);
  const villa = await updateVilla(id, update);

  if (!villa) {
    return NextResponse.json({ ok: false, error: "الفيلا غير موجودة" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, villa });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await deleteVilla(id);

  if (!deleted) {
    return NextResponse.json({ ok: false, error: "الفيلا غير موجودة" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
