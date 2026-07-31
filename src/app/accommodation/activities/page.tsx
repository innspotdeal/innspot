import type { Metadata } from "next";
import ActivitiesGridView from "@/components/ActivitiesGridView";

export const metadata: Metadata = {
  title: "الأنشطة | إنسبوت",
  description: "استكشف كل الأنشطة المتاحة في الفيوم مع إنسبوت",
};

export default function ActivitiesPage() {
  return <ActivitiesGridView />;
}
