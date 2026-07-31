import type { Metadata } from "next";
import HotelsGridView from "@/components/HotelsGridView";

export const metadata: Metadata = {
  title: "الفنادق | إنسبوت",
  description: "استكشف كل الفنادق المتاحة في الفيوم مع إنسبوت",
};

export default function HotelsPage() {
  return <HotelsGridView />;
}
