import { NextResponse } from "next/server";
import { deleteProgram, updateProgram, type ProgramUpdateInput } from "@/lib/programs-repo";

function toList(value: unknown): string[] {
  return typeof value === "string"
    ? value.split("\n").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
}

function toImageList(value: unknown): string[] {
  return typeof value === "string"
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
}

function parseUpdateInput(body: unknown): ProgramUpdateInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const update: ProgramUpdateInput = {};

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (b.highlights !== undefined) update.highlights = toList(b.highlights);
  if (b.highlightsEn !== undefined) update.highlightsEn = toList(b.highlightsEn);
  if (typeof b.duration === "string") update.duration = b.duration.trim();
  if (typeof b.durationEn === "string") update.durationEn = b.durationEn.trim();
  if (b.includes !== undefined) update.includes = toList(b.includes);
  if (b.includesEn !== undefined) update.includesEn = toList(b.includesEn);
  if (b.images !== undefined) update.images = toImageList(b.images);
  if (b.isCustom !== undefined) update.isCustom = Boolean(b.isCustom);

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

  const program = await updateProgram(id, parseUpdateInput(body));
  if (!program) {
    return NextResponse.json({ ok: false, error: "البرنامج غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, program });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await deleteProgram(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "البرنامج غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
