import AdminBookingsView from "@/components/AdminBookingsView";
import { generateBookingReference } from "@/lib/receipt";

export const dynamic = "force-dynamic";

export default function AdminBookingsPage() {
  return <AdminBookingsView initialReference={generateBookingReference()} />;
}
