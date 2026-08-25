import { listVillas } from "@/lib/villas-repo";
import AdminVillasView from "@/components/AdminVillasView";

export const dynamic = "force-dynamic";

export default async function AdminVillasPage() {
  const villas = await listVillas();
  return <AdminVillasView initialVillas={villas} />;
}
