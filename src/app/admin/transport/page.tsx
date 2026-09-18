import { listTransportVehicles } from "@/lib/transport-repo";
import AdminTransportView from "@/components/AdminTransportView";

export const dynamic = "force-dynamic";

export default async function AdminTransportPage() {
  const vehicles = await listTransportVehicles();
  return <AdminTransportView initialVehicles={vehicles} />;
}
