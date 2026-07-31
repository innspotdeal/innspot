import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccommodationDetailView from "@/components/AccommodationDetailView";
import HotelDetailView from "@/components/HotelDetailView";
import { villas } from "@/data/accommodations";
import { hotels } from "@/data/hotels";

function findItem(id: string) {
  const villa = villas.find((item) => item.id === id);
  if (villa) return { kind: "villa" as const, item: villa };

  const hotel = hotels.find((item) => item.id === id);
  if (hotel) return { kind: "hotel" as const, item: hotel };

  return null;
}

export function generateStaticParams() {
  return [...villas, ...hotels].map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = findItem(id);

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
  const found = findItem(id);

  if (!found) {
    notFound();
  }

  if (found.kind === "hotel") {
    return <HotelDetailView item={found.item} />;
  }

  return <AccommodationDetailView item={found.item} isVilla />;
}
