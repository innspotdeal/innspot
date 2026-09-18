import type { Metadata } from "next";
import CorporateTripsListView from "@/components/CorporateTripsListView";
import { listPrograms } from "@/lib/programs-repo";
import { getStartingPrices } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "رحلات شركات | إنسبوت",
  description: "برامج رحلات جماعية مصممة خصيصًا للشركات في الفيوم",
};

export const revalidate = 60;

export default async function CorporateTripsPage() {
  const corporatePrograms = await listPrograms();
  // "يبدأ من" لكل برنامج — البرامج المخصّصة مالهاش سعر ثابت فبتتشال
  const startingPrices = await getStartingPrices(
    corporatePrograms.filter((p) => !p.isCustom).map((p) => p.id)
  );
  return (
    <CorporateTripsListView corporatePrograms={corporatePrograms} startingPrices={startingPrices} />
  );
}
