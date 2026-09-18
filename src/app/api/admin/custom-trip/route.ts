import { NextResponse } from "next/server";
import { createOption, listAllOptions, type OptionInput } from "@/lib/custom-trip-repo";
import { OPTION_KINDS, PRICE_UNITS, type OptionKind, type PriceUnit } from "@/data/custom-trip";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseOptionInput(
  body: unknown,
  opts: { requireId?: boolean } = {}
): { ok: true; data: OptionInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { ok: false, error: "الاسم مطلوب" };

  const kind = b.kind as OptionKind;
  if (!OPTION_KINDS.includes(kind)) return { ok: false, error: "نوع الخيار غير صالح" };

  const priceUnit = (b.priceUnit as PriceUnit) ?? "per_person";
  if (!PRICE_UNITS.includes(priceUnit)) return { ok: false, error: "طريقة حساب السعر غير صالحة" };

  const rawId = typeof b.id === "string" && b.id.trim() ? b.id.trim() : `${kind}-${slugify(name)}`;
  const id = slugify(rawId);
  if (opts.requireId && !id) return { ok: false, error: "تعذر تكوين معرّف صالح" };

  return {
    ok: true,
    data: {
      id,
      kind,
      parentId: typeof b.parentId === "string" ? b.parentId.trim() : "",
      name,
      nameEn: typeof b.nameEn === "string" ? b.nameEn.trim() : "",
      description: typeof b.description === "string" ? b.description.trim() : "",
      descriptionEn: typeof b.descriptionEn === "string" ? b.descriptionEn.trim() : "",
      price: Number(b.price) || 0,
      priceUnit,
      capacity: Number(b.capacity) || 0,
      tier: typeof b.tier === "string" ? b.tier.trim() : "",
      includesBreakfast: Boolean(b.includesBreakfast),
      image: typeof b.image === "string" ? b.image.trim() : "",
      images: Array.isArray(b.images) ? b.images.filter((v): v is string => typeof v === "string") : [],
      rating: Math.min(5, Math.max(0, Number(b.rating) || 0)),
      active: b.active === undefined ? true : Boolean(b.active),
    },
  };
}

export async function GET() {
  const options = await listAllOptions();
  return NextResponse.json({ ok: true, options });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = parseOptionInput(body, { requireId: true });
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const option = await createOption(parsed.data);
    return NextResponse.json({ ok: true, option }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("duplicate key")
        ? "فيه خيار بنفس المعرّف موجود بالفعل"
        : "حدث خطأ أثناء الإضافة";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
