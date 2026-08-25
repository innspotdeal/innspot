import { listActivities } from "@/lib/activities-repo";
import AdminActivitiesView from "@/components/AdminActivitiesView";

export const dynamic = "force-dynamic";

export default async function AdminActivitiesPage() {
  const activities = await listActivities();
  return <AdminActivitiesView initialActivities={activities} />;
}
