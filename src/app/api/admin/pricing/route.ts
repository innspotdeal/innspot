import { NextResponse } from "next/server";
import {
  getAddonPrices,
  getPricingSettings,
  listProgramPricing,
  setAddonPrice,
  setPricingSettings,
  setProgramPricing,
  type MarginTier,
} from "@/lib/pricing";
import { listPrograms } from "@/lib/programs-repo";

export async function GET() {
  const [programs, programPricing, addonPrices, settings] = await Promise.all([
    listPrograms(),
    listProgramPricing(),
    getAddonPrices(),
    getPricingSettings(),
  ]);

  return NextResponse.json({
    ok: true,
    programs: programs.map((p) => ({ id: p.id, name: p.name, isCustom: p.isCustom })),
    programPricing,
    addonPrices,
    settings,
  });
}

function parseMarginTiers(value: unknown): MarginTier[] | null {
  if (!Array.isArray(value)) return null;
  const tiers: MarginTier[] = [];
  for (const item of value) {
    const t = item as Record<string, unknown>;
    const minPeople = Number(t.minPeople);
    const margin = Number(t.margin);
    if (!Number.isFinite(minPeople) || !Number.isFinite(margin)) return null;
    tiers.push({ minPeople, margin });
  }
  return tiers;
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;

  if (b.programPricing !== undefined) {
    const entries = Object.entries(b.programPricing as Record<string, unknown>);
    for (const [programId, raw] of entries) {
      const p = raw as Record<string, unknown>;
      await setProgramPricing(programId, {
        breakfastPerPerson: Number(p.breakfastPerPerson) || 0,
        lunchPerPerson: Number(p.lunchPerPerson) || 0,
        ticketsPerPerson: Number(p.ticketsPerPerson) || 0,
        carPrice: Number(p.carPrice) || 0,
      });
    }
  }

  if (b.addonPrices !== undefined) {
    const entries = Object.entries(b.addonPrices as Record<string, unknown>);
    for (const [key, price] of entries) {
      await setAddonPrice(key, Number(price) || 0);
    }
  }

  if (b.settings !== undefined) {
    const s = b.settings as Record<string, unknown>;
    const marginTiers = parseMarginTiers(s.marginTiers);
    if (marginTiers === null) {
      return NextResponse.json({ ok: false, error: "شرائح هامش الربح غير صالحة" }, { status: 400 });
    }
    await setPricingSettings({
      peoplePerCar: Number(s.peoplePerCar) || 1,
      marginTiers,
    });
  }

  return NextResponse.json({ ok: true });
}
