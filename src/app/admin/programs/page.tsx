import { listPrograms } from "@/lib/programs-repo";
import AdminProgramsView from "@/components/AdminProgramsView";

export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  const programs = await listPrograms();
  return <AdminProgramsView initialPrograms={programs} />;
}
