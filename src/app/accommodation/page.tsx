import type { Metadata } from "next";
import AccommodationListView from "@/components/AccommodationListView";

export const metadata: Metadata = {
  title: "أفراد وإقامة | إنسبوت",
  description: "استكشف أفضل الفيلات والفنادق في الفيوم مع إنسبوت",
};

export default function AccommodationPage() {
  return <AccommodationListView />;
}
