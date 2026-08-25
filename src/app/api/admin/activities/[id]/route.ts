import { NextResponse } from "next/server";
import { deleteActivity, updateActivity, type ActivityUpdateInput } from "@/lib/activities-repo";

function parseUpdateInput(body: unknown): ActivityUpdateInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const update: ActivityUpdateInput = {};

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (typeof b.image === "string") update.image = b.image.trim();

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

  const activity = await updateActivity(id, parseUpdateInput(body));
  if (!activity) {
    return NextResponse.json({ ok: false, error: "النشاط غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, activity });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await deleteActivity(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "النشاط غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
