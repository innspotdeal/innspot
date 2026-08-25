import { NextResponse } from "next/server";
import { createVilla, listVillas, type VillaInput } from "@/lib/villas-repo";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseVillaInput(body: unknown): { ok: true; data: VillaInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const nameEn = typeof b.nameEn === "string" ? b.nameEn.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const descriptionEn = typeof b.descriptionEn === "string" ? b.descriptionEn.trim() : "";

  if (!name || !nameEn) {
    return { ok: false, error: "اسم الفيلا (عربي وإنجليزي) مطلوب" };
  }

  const rooms = Number(b.rooms) || 0;
  const beds = Number(b.beds) || 0;
  const capacity = Number(b.capacity) || 0;
  const priceWeekday = Number(b.priceWeekday) || 0;
  const priceWeekend = Number(b.priceWeekend) || 0;
  const hasPool = Boolean(b.hasPool);
  const hasGarden = Boolean(b.hasGarden);

  const toList = (value: unknown): string[] =>
    typeof value === "string"
      ? value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string")
        : [];

  const amenities = toList(b.amenities);
  const amenitiesEn = toList(b.amenitiesEn);
  const images = toList(b.images);

  const rawId = typeof b.id === "string" && b.id.trim() ? b.id.trim() : slugify(nameEn || name);
  const id = slugify(rawId);
  if (!id) {
    return { ok: false, error: "تعذر تكوين معرّف صالح للفيلا" };
  }

  return {
    ok: true,
    data: {
      id,
      name,
      nameEn,
      description,
      descriptionEn,
      images,
      rooms,
      beds,
      hasPool,
      hasGarden,
      capacity,
      amenities,
      amenitiesEn,
      priceWeekday,
      priceWeekend,
    },
  };
}

export async function GET() {
  const villas = await listVillas();
  return NextResponse.json({ ok: true, villas });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = parseVillaInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const villa = await createVilla(parsed.data);
    return NextResponse.json({ ok: true, villa }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("duplicate key")
        ? "فيلا بنفس المعرّف موجودة بالفعل"
        : "حدث خطأ أثناء إضافة الفيلا";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
