import { NextResponse } from "next/server";
import { getSafariInfo, setSafariInfo } from "@/lib/safari-info";
import { createVehicle, listTransportVehicles } from "@/lib/transport-repo";

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET() {
  const [vehicles, safariInfo] = await Promise.all([listTransportVehicles(), getSafariInfo()]);
  return NextResponse.json({ ok: true, vehicles, safariInfo });
}

// صور السفاري ووصفها اللي بيظهروا للعميل جنب «عايز سفاري»: { safariInfo: { description, descriptionEn, images } }
export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const info = ((body ?? {}) as Record<string, unknown>).safariInfo as Record<string, unknown> | undefined;
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const images = Array.isArray(info?.images)
    ? info.images.filter((src): src is string => typeof src === "string" && src.trim() !== "").map((src) => src.trim())
    : [];
  const description = text(info?.description);
  const descriptionEn = text(info?.descriptionEn);
  if (!info || description.length > 2000 || descriptionEn.length > 2000 || images.length > 12) {
    return NextResponse.json({ ok: false, error: "بيانات السفاري غير صالحة" }, { status: 400 });
  }

  await setSafariInfo({ description, descriptionEn, images });
  return NextResponse.json({ ok: true, safariInfo: { description, descriptionEn, images } });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return NextResponse.json({ ok: false, error: "الاسم مطلوب" }, { status: 400 });

  const group = b.group === "safari" ? "safari" : "bus";
  const id = slugify(typeof b.id === "string" && b.id.trim() ? b.id : `${group}-${name}`);

  try {
    const vehicle = await createVehicle({
      id,
      group,
      name,
      nameEn: typeof b.nameEn === "string" ? b.nameEn.trim() : "",
      capacity: Number(b.capacity) || 0,
      price: Number(b.price) || 0,
      active: b.active === undefined ? true : Boolean(b.active),
    });
    return NextResponse.json({ ok: true, vehicle }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("duplicate key")
        ? "فيه مركبة بنفس المعرّف موجودة"
        : "حدث خطأ أثناء الإضافة";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
