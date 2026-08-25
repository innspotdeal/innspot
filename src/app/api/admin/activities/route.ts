import { NextResponse } from "next/server";
import { createActivity, listActivities, type ActivityInput } from "@/lib/activities-repo";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseActivityInput(
  body: unknown
): { ok: true; data: ActivityInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const nameEn = typeof b.nameEn === "string" ? b.nameEn.trim() : "";
  if (!name || !nameEn) {
    return { ok: false, error: "اسم النشاط (عربي وإنجليزي) مطلوب" };
  }

  const rawId = typeof b.id === "string" && b.id.trim() ? b.id.trim() : slugify(nameEn || name);
  const id = slugify(rawId);
  if (!id) return { ok: false, error: "تعذر تكوين معرّف صالح للنشاط" };

  return {
    ok: true,
    data: {
      id,
      name,
      nameEn,
      description: typeof b.description === "string" ? b.description.trim() : "",
      descriptionEn: typeof b.descriptionEn === "string" ? b.descriptionEn.trim() : "",
      image: typeof b.image === "string" ? b.image.trim() : "",
    },
  };
}

export async function GET() {
  const activities = await listActivities();
  return NextResponse.json({ ok: true, activities });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = parseActivityInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const activity = await createActivity(parsed.data);
    return NextResponse.json({ ok: true, activity }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("duplicate key")
        ? "نشاط بنفس المعرّف موجود بالفعل"
        : "حدث خطأ أثناء إضافة النشاط";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
