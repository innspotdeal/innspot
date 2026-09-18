import { listAllOptions } from "@/lib/custom-trip-repo";
import AdminCustomTripView from "@/components/AdminCustomTripView";

export const dynamic = "force-dynamic";

export default async function AdminCustomTripPage() {
  const options = await listAllOptions();
  return <AdminCustomTripView initialOptions={options} />;
}
