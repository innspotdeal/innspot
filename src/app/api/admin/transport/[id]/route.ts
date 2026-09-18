import { NextResponse } from "next/server";
import { deleteVehicle, updateVehicle } from "@/lib/transport-repo";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (b.group === "safari" || b.group === "bus") update.group = b.group;
  if (b.capacity !== undefined) update.capacity = Number(b.capacity) || 0;
  if (b.price !== undefined) update.price = Number(b.price) || 0;
  if (b.active !== undefined) update.active = Boolean(b.active);

  const vehicle = await updateVehicle(id, update);
  if (!vehicle) {
    return NextResponse.json({ ok: false, error: "المركبة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, vehicle });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await deleteVehicle(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "المركبة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
