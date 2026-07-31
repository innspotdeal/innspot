import type { Metadata } from "next";
import CorporateTripsListView from "@/components/CorporateTripsListView";

export const metadata: Metadata = {
  title: "رحلات شركات | إنسبوت",
  description: "برامج رحلات جماعية مصممة خصيصًا للشركات في الفيوم",
};

export default function CorporateTripsPage() {
  return <CorporateTripsListView />;
}
