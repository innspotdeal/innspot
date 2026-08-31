"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/admin/bookings", label: "الحجوزات" },
  { href: "/admin/villas", label: "الفيلات" },
  { href: "/admin/hotels", label: "الفنادق" },
  { href: "/admin/activities", label: "الأنشطة" },
  { href: "/admin/programs", label: "برامج الشركات" },
  { href: "/admin/pricing", label: "التسعير" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <nav className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
