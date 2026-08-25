import { listHotels } from "@/lib/hotels-repo";
import AdminHotelsView from "@/components/AdminHotelsView";

export const dynamic = "force-dynamic";

export default async function AdminHotelsPage() {
  const hotels = await listHotels();
  return <AdminHotelsView initialHotels={hotels} />;
}
