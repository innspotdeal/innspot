"use client";

import AccommodationCard from "@/components/AccommodationCard";
import HotelCard from "@/components/HotelCard";
import ActivityCard from "@/components/ActivityCard";
import ScrollRow from "@/components/ScrollRow";
import { villas } from "@/data/accommodations";
import { hotels } from "@/data/hotels";
import { activities } from "@/data/activities";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

export default function AccommodationListView() {
  const { lang } = useLanguage();
  const t = translations[lang].accommodationPage;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand-blue sm:text-4xl">{t.title}</h1>
        <p className="mt-3 text-neutral-600">{t.subtitle}</p>
      </div>

      <ScrollRow title={t.villasHeading} href="/accommodation/villas">
        {villas.map((villa) => (
          <div key={villa.id} className="w-56 shrink-0 sm:w-64">
            <AccommodationCard item={villa} />
          </div>
        ))}
      </ScrollRow>

      <ScrollRow title={t.hotelsHeading} href="/accommodation/hotels">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="w-56 shrink-0 sm:w-64">
            <HotelCard item={hotel} />
          </div>
        ))}
      </ScrollRow>

      <ScrollRow title={t.activitiesHeading} href="/accommodation/activities">
        {activities.map((activity) => (
          <div key={activity.id} className="w-56 shrink-0 sm:w-64">
            <ActivityCard item={activity} />
          </div>
        ))}
      </ScrollRow>
    </div>
  );
}
