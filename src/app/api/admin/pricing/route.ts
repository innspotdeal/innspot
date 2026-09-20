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
import { listAllProgramTiers, setProgramTiers, TIER_KINDS, type PriceTier, type TierKind } from "@/lib/pricing";

export async function GET() {
  const [programs, programPricing, addonPrices, settings, programTiers] = await Promise.all([
    listPrograms(),
    listProgramPricing(),
    getAddonPrices(),
    getPricingSettings(),
    listAllProgramTiers(),
  ]);

  return NextResponse.json({
    ok: true,
    programs: programs.map((p) => ({ id: p.id, name: p.name, isCustom: p.isCustom })),
    programPricing,
    programTiers,
    addonPrices,
    settings,
  });
}

function parseMarginTiers(value: unknown): MarginTier[] | null {
  if (!Array.isArray(value)) return null;
  const tiers: MarginTier[] = [];
  for (const item of value) {
    const t = item as Record<string, unknown>;
    const fromPeople = Number(t.fromPeople);
    const toPeople = Number(t.toPeople) || 0;
    const margin = Number(t.margin);
    if (!Number.isFinite(fromPeople) || !Number.isFinite(margin)) return null;
    tiers.push({ fromPeople, toPeople, margin });
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
        transportGroup: p.transportGroup === "bus" ? "bus" : "safari",
        needsBus: p.needsBus === undefined ? true : Boolean(p.needsBus),
        needsSafari: Boolean(p.needsSafari),
      });
    }
  }

  if (b.programTiers !== undefined) {
    const entries = Object.entries(b.programTiers as Record<string, unknown>);
    for (const [programId, raw] of entries) {
      if (!Array.isArray(raw)) continue;
      const tiers: PriceTier[] = [];
      for (const item of raw) {
        const t = item as Record<string, unknown>;
        if (!TIER_KINDS.includes(t.kind as TierKind)) continue;
        tiers.push({
          kind: t.kind as TierKind,
          fromPeople: Number(t.fromPeople) || 0,
          toPeople: Number(t.toPeople) || 0,
          price: Number(t.price) || 0,
        });
      }
      await setProgramTiers(programId, tiers);
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
