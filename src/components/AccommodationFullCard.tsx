"use client";

import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getAmenityIconClass } from "@/lib/amenityIcon";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { Accommodation } from "@/data/accommodations";

export default function AccommodationFullCard({ item }: { item: Accommodation }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const name = lang === "en" ? item.nameEn : item.name;
  const description = lang === "en" ? item.descriptionEn : item.description;
  const amenities = lang === "en" ? item.amenitiesEn : item.amenities;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/accommodation/${item.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full bg-neutral-100">
          <Image
            src={item.images[0]}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="text-lg font-extrabold text-brand-blue">{name}</h3>
          <p className="text-sm leading-relaxed text-neutral-600">{description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold text-neutral-500">
              {t.accommodationCard.weekdayPrice}:{" "}
              <span className="font-extrabold text-brand-orange">
                {t.accommodationCard.currency(item.priceWeekday)}
              </span>
            </span>
            <span className="font-semibold text-neutral-500">
              {t.accommodationCard.weekendPrice}:{" "}
              <span className="font-extrabold text-brand-orange">
                {t.accommodationCard.currency(item.priceWeekend)}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-neutral-700">
            <span>{t.accommodationCard.rooms(item.rooms)}</span>
            <span className="flex items-center gap-1">
              <i className="fi fi-rr-bed-alt" aria-hidden="true" />
              {t.accommodationCard.beds(item.beds)}
            </span>
            <span className="flex items-center gap-1">
              <i className="fi fi-sr-user" aria-hidden="true" />
              {t.accommodationCard.capacity(item.capacity)}
            </span>
          </div>

          <ul className="flex flex-wrap gap-2">
            {item.hasPool && (
              <li className="flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                <i className={getAmenityIconClass(t.accommodationCard.pool) ?? ""} aria-hidden="true" />
                {t.accommodationCard.pool}
              </li>
            )}
            {item.hasGarden && (
              <li className="flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                <i className={getAmenityIconClass(t.accommodationCard.garden) ?? ""} aria-hidden="true" />
                {t.accommodationCard.garden}
              </li>
            )}
            {amenities.map((amenity) => {
              const iconClass = getAmenityIconClass(amenity);
              return (
                <li
                  key={amenity}
                  className="flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue"
                >
                  {iconClass && <i className={iconClass} aria-hidden="true" />}
                  {amenity}
                </li>
              );
            })}
          </ul>

          <span className="mt-auto pt-2 text-sm font-bold text-brand-orange">
            {t.accommodationCard.fullDetails}
          </span>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <WhatsAppButton message={t.inquiry(name)} className="w-full" />
      </div>
    </div>
  );
}
