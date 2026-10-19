import { NextResponse } from "next/server";
import { corporatePrograms } from "@/data/programs";
import { createProgram, listPrograms } from "@/lib/programs-repo";

// برنامج الكاستم الأصلي (data/programs.ts)
const ORIGINAL_BUILDER = corporatePrograms.find((p) => p.isBuilder) ?? null;

// برنامج الكاستم بيظهر على الموقع بس وهو متسجل؛ لو اتمسح (اتوقف) الطلب ده بيرجّعه
// بمحتواه الأصلي، ويتعدّل بعد كده من الـ ERP زي أي برنامج
export async function POST() {
  const existing = (await listPrograms()).find((p) => p.isBuilder);
  if (existing) {
    return NextResponse.json({ ok: true, program: existing });
  }
  if (!ORIGINAL_BUILDER) {
    return NextResponse.json({ ok: false, error: "مفيش برنامج كاستم أصلي" }, { status: 404 });
  }

  try {
    const program = await createProgram(ORIGINAL_BUILDER);
    return NextResponse.json({ ok: true, program }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("duplicate key")
        ? `فيه برنامج تاني بنفس المعرّف (${ORIGINAL_BUILDER.id}) — امسحه أو علّمه كبرنامج الكاستم`
        : "حدث خطأ أثناء إرجاع برنامج الكاستم";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
