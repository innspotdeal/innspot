import { listPrograms } from "@/lib/programs-repo";
import { getAddonPrices, getPricingSettings, listProgramPricing } from "@/lib/pricing";
import { ADDON_OPTIONS } from "@/data/addons";
import AdminPricingView from "@/components/AdminPricingView";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const [programs, programPricing, addonPrices, settings] = await Promise.all([
    listPrograms(),
    listProgramPricing(),
    getAddonPrices(),
    getPricingSettings(),
  ]);

  return (
    <AdminPricingView
      programs={programs.map((p) => ({ id: p.id, name: p.name, isCustom: p.isCustom }))}
      initialProgramPricing={programPricing}
      addonOptions={ADDON_OPTIONS.map((a) => ({ key: a.key, label: a.label }))}
      initialAddonPrices={addonPrices}
      initialSettings={settings}
    />
  );
}
