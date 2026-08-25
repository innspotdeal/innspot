"use client";

import Link from "next/link";
import HotelFullCard from "@/components/HotelFullCard";
import type { Hotel } from "@/data/hotels";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

export default function HotelsGridView({ hotels }: { hotels: Hotel[] }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/accommodation"
        className="text-sm font-semibold text-brand-blue hover:text-brand-orange"
      >
        {t.accommodationDetail.back}
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold text-brand-blue sm:text-4xl">
        {t.accommodationPage.hotelsHeading}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <HotelFullCard key={hotel.id} item={hotel} />
        ))}
      </div>
    </div>
  );
}
