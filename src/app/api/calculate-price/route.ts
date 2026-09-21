import { NextResponse } from "next/server";
import { calculatePrice, MIN_PEOPLE } from "@/lib/pricing";
import { getProgramById } from "@/lib/programs-repo";

type Lang = "ar" | "en";

const MESSAGES: Record<Lang, Record<string, string>> = {
  ar: {
    invalidRequest: "بيانات الطلب غير صالحة",
    selectProgram: "يرجى اختيار برنامج الرحلة",
    programNotFound: "برنامج الرحلة غير موجود",
    peopleInvalid: "عدد الأفراد يجب أن يكون رقمًا صحيحًا موجبًا",
    minPeople: `الحد الأدنى للحجز ${MIN_PEOPLE} فرد`,
  },
  en: {
    invalidRequest: "Invalid request data",
    selectProgram: "Please select a trip program",
    programNotFound: "Trip program not found",
    peopleInvalid: "Number of people must be a positive whole number",
    minPeople: `Minimum booking is ${MIN_PEOPLE} people`,
  },
};

// نقطة API لحساب سعر الرحلة
// الفرونت إند يرسل: معرّف البرنامج، عدد الأفراد، الإضافات المختارة، ولغة العرض فقط
// كل منطق التسعير الفعلي يعمل داخل lib/pricing.ts على السيرفر فقط
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: MESSAGES.ar.invalidRequest },
      { status: 400 }
    );
  }

  const { programId, people, addons, includeTransport, lang: rawLang } = (body ?? {}) as {
    programId?: unknown;
    people?: unknown;
    addons?: unknown;
    includeTransport?: unknown;
    lang?: unknown;
  };

  const lang: Lang = rawLang === "en" ? "en" : "ar";
  const t = MESSAGES[lang];

  if (typeof programId !== "string" || !programId) {
    return NextResponse.json({ ok: false, error: t.selectProgram }, { status: 400 });
  }

  const program = await getProgramById(programId);
  if (!program) {
    return NextResponse.json({ ok: false, error: t.programNotFound }, { status: 400 });
  }

  const peopleNumber = Number(people);
  if (!Number.isInteger(peopleNumber) || peopleNumber <= 0) {
    return NextResponse.json({ ok: false, error: t.peopleInvalid }, { status: 400 });
  }

  if (peopleNumber < MIN_PEOPLE) {
    return NextResponse.json({ ok: false, error: t.minPeople }, { status: 400 });
  }

  // الإضافات اللي مش متاحة للبرنامج ده بيتجاهلها محرك التسعير نفسه
  const addonIds = (Array.isArray(addons) ? addons : []).filter(
    (id): id is string => typeof id === "string"
  );

  const result = await calculatePrice({
    programId,
    people: peopleNumber,
    addons: addonIds,
    includeTransport: includeTransport === undefined ? true : Boolean(includeTransport),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const label = (o: { name: string; nameEn: string }) => (lang === "en" ? o.nameEn || o.name : o.name);

  return NextResponse.json({
    ok: true,
    programName: lang === "en" ? program.nameEn : program.name,
    people: peopleNumber,
    addonLabels: result.selectedAddons.map(label),
    includedLabels: result.includedAddons.map(label),
    pricePerPerson: result.pricePerPerson,
    total: result.total,
  });
}
