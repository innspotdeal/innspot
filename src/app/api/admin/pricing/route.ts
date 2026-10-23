import { NextResponse } from "next/server";
import {
  getPricingSettings,
  listProgramPricing,
  setPricingSettings,
  setProgramPricing,
  type MarginTier,
} from "@/lib/pricing";
import {
  ADDON_MODES,
  listAddonCatalogue,
  listProgramAddonModes,
  setProgramAddonModes,
  type AddonMode,
} from "@/lib/program-addons";
import { listPrograms, updateProgram } from "@/lib/programs-repo";
import { toTicketPrice } from "@/lib/program-input";
import { listAllProgramTiers, setProgramTiers, TIER_KINDS, type PriceTier, type TierKind } from "@/lib/pricing";

export async function GET() {
  const [programs, programPricing, settings, programTiers, catalogue, programAddons] =
    await Promise.all([
      listPrograms(),
      listProgramPricing(),
      getPricingSettings(),
      listAllProgramTiers(),
      listAddonCatalogue(),
      listProgramAddonModes(),
    ]);

  return NextResponse.json({
    ok: true,
    programs: programs.map((p) => ({ id: p.id, name: p.name, isCustom: p.isCustom, isTicket: p.isTicket, ticketPrice: p.ticketPrice })),
    programPricing,
    programTiers,
    // قايمة الإضافات الموحدة (بتتعدل من /api/admin/custom-trip)
    addons: catalogue.map((o) => ({
      id: o.id,
      name: o.name,
      nameEn: o.nameEn,
      price: o.price,
      priceUnit: o.priceUnit,
      active: o.active,
    })),
    // programId → optionId → included | hidden (اللي مش موجود = متاحة كإضافة)
    programAddons,
    settings,
  });
}

// كل شريحة: { fromPeople, toPeople, marginPerPerson } — المكسب على كل فرد.
// margin القديم (مبلغ على الرحلة كلها) مرفوض: لو اتقبل كأنه للفرد هيبوّظ الأسعار
function parseMarginTiers(value: unknown): { ok: true; tiers: MarginTier[] } | { ok: false; error: string } {
  if (!Array.isArray(value)) return { ok: false, error: "شرائح المكسب غير صالحة" };
  const tiers: MarginTier[] = [];
  for (const item of value) {
    const t = item as Record<string, unknown>;
    if (t.marginPerPerson === undefined && t.margin !== undefined) {
      return {
        ok: false,
        error: "شرائح المكسب بقت بالفرد: ابعت marginPerPerson (المكسب على كل فرد) بدل margin",
      };
    }
    const fromPeople = Number(t.fromPeople);
    const toPeople = Number(t.toPeople) || 0;
    const marginPerPerson = Number(t.marginPerPerson);
    if (!Number.isFinite(fromPeople) || !Number.isFinite(marginPerPerson) || marginPerPerson < 0) {
      return { ok: false, error: "شرائح المكسب غير صالحة" };
    }
    tiers.push({ fromPeople, toPeople, marginPerPerson });
  }
  return { ok: true, tiers };
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
        // لوحة تحكم أقدم مش بتبعته: يفضل زي ما هو
        safariOptional: p.safariOptional === undefined ? undefined : Boolean(p.safariOptional),
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

  // سعر التذكرة الثابت لبرامج التذاكر: { programId: سعر الفرد }
  if (b.ticketPrices !== undefined) {
    const entries = Object.entries((b.ticketPrices ?? {}) as Record<string, unknown>);
    for (const [programId, price] of entries) {
      await updateProgram(programId, { ticketPrice: toTicketPrice(price) });
    }
  }

  // القايمة القديمة اتلغت — الأسعار بقت على الإضافة نفسها في قايمة الإضافات
  if (b.addonPrices !== undefined) {
    return NextResponse.json(
      { ok: false, error: "أسعار الإضافات بتتعدل من قايمة الإضافات (/api/admin/custom-trip)" },
      { status: 400 }
    );
  }

  if (b.programAddons !== undefined) {
    const catalogueIds = new Set((await listAddonCatalogue()).map((o) => o.id));
    const entries = Object.entries((b.programAddons ?? {}) as Record<string, unknown>);
    for (const [programId, raw] of entries) {
      const modes: Record<string, AddonMode> = {};
      for (const [optionId, mode] of Object.entries((raw ?? {}) as Record<string, unknown>)) {
        if (!catalogueIds.has(optionId)) continue;
        if (!ADDON_MODES.includes(mode as AddonMode)) {
          return NextResponse.json({ ok: false, error: "وضع الإضافة غير صالح" }, { status: 400 });
        }
        modes[optionId] = mode as AddonMode;
      }
      await setProgramAddonModes(programId, modes);
    }
  }

  if (b.settings !== undefined) {
    const s = b.settings as Record<string, unknown>;
    const parsed = parseMarginTiers(s.marginTiers);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }
    await setPricingSettings({
      peoplePerCar: Number(s.peoplePerCar) || 1,
      marginTiers: parsed.tiers,
    });
  }

  return NextResponse.json({ ok: true });
}
