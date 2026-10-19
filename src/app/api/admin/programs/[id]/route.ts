import { NextResponse } from "next/server";
import { deleteProgram, updateProgram, type ProgramUpdateInput } from "@/lib/programs-repo";
import { toImageList, toItinerary, toList, toMinPeople } from "@/lib/program-input";

function parseUpdateInput(
  body: unknown
): { ok: true; data: ProgramUpdateInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const update: ProgramUpdateInput = {};

  if (typeof b.name === "string") update.name = b.name.trim();
  if (typeof b.nameEn === "string") update.nameEn = b.nameEn.trim();
  if (typeof b.description === "string") update.description = b.description.trim();
  if (typeof b.descriptionEn === "string") update.descriptionEn = b.descriptionEn.trim();
  if (b.itinerary !== undefined) update.itinerary = toItinerary(b.itinerary, b.itineraryEn);
  if (typeof b.startTime === "string") update.startTime = b.startTime.trim();
  if (typeof b.endTime === "string") update.endTime = b.endTime.trim();
  if (typeof b.duration === "string") update.duration = b.duration.trim();
  if (typeof b.durationEn === "string") update.durationEn = b.durationEn.trim();
  if (b.includes !== undefined) update.includes = toList(b.includes);
  if (b.includesEn !== undefined) update.includesEn = toList(b.includesEn);
  if (b.images !== undefined) update.images = toImageList(b.images);
  if (b.isCustom !== undefined) update.isCustom = Boolean(b.isCustom);
  if (b.isTicket !== undefined) update.isTicket = Boolean(b.isTicket);
  if (b.isBuilder !== undefined) update.isBuilder = Boolean(b.isBuilder);
  // برنامج الكاستم (مكوّن الرحلة) سعره بالطلب دايمًا، ومش برنامج تذاكر
  if (update.isBuilder) {
    update.isCustom = true;
    update.isTicket = false;
  }
  if (b.minPeople !== undefined) {
    const minPeople = toMinPeople(b.minPeople);
    if (minPeople === null) return { ok: false, error: "أقل عدد أفراد لازم يكون رقم صحيح من 1 لـ 1000" };
    update.minPeople = minPeople;
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

  const program = await updateProgram(id, parsed.data);
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
