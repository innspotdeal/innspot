import type { Metadata } from "next";
import VillasGridView from "@/components/VillasGridView";
import { listVillas } from "@/lib/villas-repo";

export const metadata: Metadata = {
  title: "الفيلات | إنسبوت",
  description: "استكشف كل الفيلات المتاحة في الفيوم مع إنسبوت",
};

export const revalidate = 60;

export default async function VillasPage() {
  const villas = await listVillas();
  return <VillasGridView villas={villas} />;
}
