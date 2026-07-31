import type { Metadata } from "next";
import VillasGridView from "@/components/VillasGridView";

export const metadata: Metadata = {
  title: "الفيلات | إنسبوت",
  description: "استكشف كل الفيلات المتاحة في الفيوم مع إنسبوت",
};

export default function VillasPage() {
  return <VillasGridView />;
}
