import { NextResponse } from "next/server";
import { createProgram, listPrograms, type ProgramInput } from "@/lib/programs-repo";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

function parseProgramInput(
  body: unknown
): { ok: true; data: ProgramInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const nameEn = typeof b.nameEn === "string" ? b.nameEn.trim() : "";
  if (!name || !nameEn) {
    return { ok: false, error: "اسم البرنامج (عربي وإنجليزي) مطلوب" };
  }

  const rawId = typeof b.id === "string" && b.id.trim() ? b.id.trim() : slugify(nameEn || name);
  const id = slugify(rawId);
  if (!id) return { ok: false, error: "تعذر تكوين معرّف صالح للبرنامج" };

  return {
    ok: true,
    data: {
      id,
      name,
      nameEn,
      description: typeof b.description === "string" ? b.description.trim() : "",
      descriptionEn: typeof b.descriptionEn === "string" ? b.descriptionEn.trim() : "",
      highlights: toList(b.highlights),
      highlightsEn: toList(b.highlightsEn),
      duration: typeof b.duration === "string" ? b.duration.trim() : "",
      durationEn: typeof b.durationEn === "string" ? b.durationEn.trim() : "",
      includes: toList(b.includes),
      includesEn: toList(b.includesEn),
      images: toImageList(b.images),
      isCustom: Boolean(b.isCustom),
    },
  };
}

export async function GET() {
  const programs = await listPrograms();
  return NextResponse.json({ ok: true, programs });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = parseProgramInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const program = await createProgram(parsed.data);
    return NextResponse.json({ ok: true, program }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("duplicate key")
        ? "برنامج بنفس المعرّف موجود بالفعل"
        : "حدث خطأ أثناء إضافة البرنامج";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
