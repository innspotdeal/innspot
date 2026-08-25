import type { Metadata } from "next";
import CorporateTripsListView from "@/components/CorporateTripsListView";
import { listPrograms } from "@/lib/programs-repo";

export const metadata: Metadata = {
  title: "رحلات شركات | إنسبوت",
  description: "برامج رحلات جماعية مصممة خصيصًا للشركات في الفيوم",
};

export const revalidate = 60;

export default async function CorporateTripsPage() {
  const corporatePrograms = await listPrograms();
  return <CorporateTripsListView corporatePrograms={corporatePrograms} />;
}
