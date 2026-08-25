import type { Metadata } from "next";
import AccommodationListView from "@/components/AccommodationListView";
import { listVillas } from "@/lib/villas-repo";
import { listHotels } from "@/lib/hotels-repo";
import { listActivities } from "@/lib/activities-repo";

export const metadata: Metadata = {
  title: "أفراد وإقامة | إنسبوت",
  description: "استكشف أفضل الفيلات والفنادق في الفيوم مع إنسبوت",
};

export const revalidate = 60;

export default async function AccommodationPage() {
  const [villas, hotels, activities] = await Promise.all([
    listVillas(),
    listHotels(),
    listActivities(),
  ]);
  return <AccommodationListView villas={villas} hotels={hotels} activities={activities} />;
}
