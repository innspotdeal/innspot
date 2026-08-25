import type { Metadata } from "next";
import ActivitiesGridView from "@/components/ActivitiesGridView";
import { listActivities } from "@/lib/activities-repo";

export const metadata: Metadata = {
  title: "الأنشطة | إنسبوت",
  description: "استكشف كل الأنشطة المتاحة في الفيوم مع إنسبوت",
};

export const revalidate = 60;

export default async function ActivitiesPage() {
  const activities = await listActivities();
  return <ActivitiesGridView activities={activities} />;
}
