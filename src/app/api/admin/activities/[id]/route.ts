import { NextResponse } from "next/server";
import { deleteActivity, updateActivity, type ActivityUpdateInput } from "@/lib/activities-repo";
import { parseActivityDetails } from "@/lib/activity-input";

function parseUpdateInput(
  body: unknown
): { ok: true; data: ActivityUpdateInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const details = parseActivityDetails(b);
  if (!details.ok) return details;
  const update: ActivityUpdateInput = { ...details.data };

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (typeof b.image === "string") update.image = b.image.trim();

  if (update.name === "" || update.nameEn === "") {
    return { ok: false, error: "اسم النشاط (عربي وإنجليزي) مطلوب" };
  }

  return { ok: true, data: update };
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

  const activity = await updateActivity(id, parsed.data);
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
