import { NextResponse } from "next/server";
import { deleteOption, updateOption, type OptionUpdateInput } from "@/lib/custom-trip-repo";
import { OPTION_KINDS, PRICE_UNITS, type OptionKind, type PriceUnit } from "@/data/custom-trip";

function parseUpdateInput(body: unknown): OptionUpdateInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const update: OptionUpdateInput = {};

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (typeof b.parentId === "string") update.parentId = b.parentId.trim();
  if (typeof b.tier === "string") update.tier = b.tier.trim();
  if (typeof b.image === "string") update.image = b.image.trim();
  if (b.price !== undefined) update.price = Number(b.price) || 0;
  if (b.capacity !== undefined) update.capacity = Number(b.capacity) || 0;
  if (b.includesBreakfast !== undefined) update.includesBreakfast = Boolean(b.includesBreakfast);
  if (b.active !== undefined) update.active = Boolean(b.active);

  if (OPTION_KINDS.includes(b.kind as OptionKind)) update.kind = b.kind as OptionKind;
  if (PRICE_UNITS.includes(b.priceUnit as PriceUnit)) update.priceUnit = b.priceUnit as PriceUnit;

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

  const option = await updateOption(id, parseUpdateInput(body));
  if (!option) {
    return NextResponse.json({ ok: false, error: "الخيار غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, option });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await deleteOption(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "الخيار غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
