import { listPrograms } from "@/lib/programs-repo";
import { getPricingSettings, listAllProgramTiers, listProgramPricing } from "@/lib/pricing";
import { listAddonCatalogue, listProgramAddonModes } from "@/lib/program-addons";
import AdminPricingView from "@/components/AdminPricingView";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const [programs, programPricing, settings, programTiers, catalogue, programAddons] =
    await Promise.all([
      listPrograms(),
      listProgramPricing(),
      getPricingSettings(),
      listAllProgramTiers(),
      listAddonCatalogue(),
      listProgramAddonModes(),
    ]);

  return (
    <AdminPricingView
      programs={programs.map((p) => ({ id: p.id, name: p.name, isCustom: p.isCustom }))}
      initialProgramPricing={programPricing}
      initialProgramTiers={programTiers}
      addons={catalogue.map((o) => ({
        id: o.id,
        name: o.name,
        nameEn: o.nameEn,
        price: o.price,
        priceUnit: o.priceUnit,
        active: o.active,
      }))}
      programAddons={programAddons}
      initialSettings={settings}
    />
  );
}
