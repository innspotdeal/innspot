import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccommodationDetailView from "@/components/AccommodationDetailView";
import HotelDetailView from "@/components/HotelDetailView";
import { getVillaById } from "@/lib/villas-repo";
import { getHotelById } from "@/lib/hotels-repo";

export const revalidate = 60;

async function findItem(id: string) {
  const villa = await getVillaById(id);
  if (villa) return { kind: "villa" as const, item: villa };

  const hotel = await getHotelById(id);
  if (hotel) return { kind: "hotel" as const, item: hotel };

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = await findItem(id);

  if (!found) {
    return { title: "غير موجود | إنسبوت" };
  }

  return {
    title: `${found.item.name} | إنسبوت`,
    description: found.item.description,
  };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = await findItem(id);

  if (!found) {
    notFound();
  }

  if (found.kind === "hotel") {
    return <HotelDetailView item={found.item} />;
  }

  return <AccommodationDetailView item={found.item} isVilla />;
}
