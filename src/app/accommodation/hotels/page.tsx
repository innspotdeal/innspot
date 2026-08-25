import type { Metadata } from "next";
import HotelsGridView from "@/components/HotelsGridView";
import { listHotels } from "@/lib/hotels-repo";

export const metadata: Metadata = {
  title: "الفنادق | إنسبوت",
  description: "استكشف كل الفنادق المتاحة في الفيوم مع إنسبوت",
};

export const revalidate = 60;

export default async function HotelsPage() {
  const hotels = await listHotels();
  return <HotelsGridView hotels={hotels} />;
}
