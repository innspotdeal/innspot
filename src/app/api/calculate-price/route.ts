import { NextResponse } from "next/server";
import { calculatePrice, isValidAddonKey, MIN_PEOPLE } from "@/lib/pricing";
import { ADDON_OPTIONS, type AddonKey } from "@/data/addons";
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

function getAddonLabel(key: AddonKey, lang: Lang): string {
  const option = ADDON_OPTIONS.find((opt) => opt.key === key);
  if (!option) return key;
  return lang === "en" ? option.labelEn : option.label;
}

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

  const rawAddons = Array.isArray(addons) ? addons : [];
  const validAddonKeys: AddonKey[] = rawAddons.filter(
    (key): key is AddonKey => typeof key === "string" && isValidAddonKey(key)
  );

  const result = await calculatePrice({
    programId,
    people: peopleNumber,
    addons: validAddonKeys,
    includeTransport: includeTransport === undefined ? true : Boolean(includeTransport),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const addonLabels = validAddonKeys.map((key) => getAddonLabel(key, lang));

  return NextResponse.json({
    ok: true,
    programName: lang === "en" ? program.nameEn : program.name,
    people: peopleNumber,
    addonLabels,
    pricePerPerson: result.pricePerPerson,
    total: result.total,
  });
}
