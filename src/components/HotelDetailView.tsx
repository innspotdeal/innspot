"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageGallery from "@/components/ImageGallery";
import RoomDialog from "@/components/RoomDialog";
import WhatsAppButton from "@/components/WhatsAppButton";
import AmenityIcon from "@/components/AmenityIcon";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { Hotel } from "@/data/hotels";

export default function HotelDetailView({ item }: { item: Hotel }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];

  const name = lang === "en" ? item.nameEn : item.name;
  const description = lang === "en" ? item.descriptionEn : item.description;
  const amenities = lang === "en" ? item.amenitiesEn : item.amenities;
  // الغرفة المفتوحة دلوقتي (رقمها في القايمة) — null = مفيش
  const [openRoom, setOpenRoom] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl pt-4 sm:pt-6">
      <div className="sticky top-0 z-0 h-[55vh] sm:h-[60vh] sm:overflow-hidden sm:rounded-3xl">
        <ImageGallery
          images={item.images}
          alt={name}
          aspectClassName="h-full"
          counterPosition="end"
        />
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t.accommodationDetail.back}
          className="absolute start-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current rtl:-scale-x-100">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 -mt-6 rounded-t-3xl bg-white px-4 pt-6 shadow-[0_-12px_24px_-8px_rgba(0,0,0,0.08)] sm:px-8">
        <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">{name}</h1>
        <p className="mt-2 text-sm font-medium text-neutral-500">
          {t.accommodationDetail.hotelBadge}
        </p>

        <div className="mt-6 border-t border-black/5 pt-6">
          <p className="leading-relaxed text-neutral-600">{description}</p>
        </div>

        {item.roomTypes.length > 0 && (
        <div className="mt-6 border-t border-black/5 pt-6">
          <h2 className="mb-4 text-lg font-bold text-brand-blue">
            {t.accommodationDetail.roomTypesHeading}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {item.roomTypes.map((roomType, index) => {
              const roomName = lang === "en" ? roomType.nameEn || roomType.name : roomType.name;
              const roomDescription =
                lang === "en" ? roomType.descriptionEn || roomType.description : roomType.description;
              return (
                <li key={`${roomType.name}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setOpenRoom(index)}
                    className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-neutral-50 text-start transition hover:border-brand-orange/40 hover:shadow-md"
                  >
                    {roomType.images.length > 0 && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                        <Image
                          src={roomType.images[0]}
                          alt={roomName}
                          fill
                          sizes="(max-width: 640px) 100vw, 400px"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                        {roomType.images.length > 1 && (
                          <span className="absolute end-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                            <i className="fi fi-sr-picture leading-none" aria-hidden="true" />
                            {roomType.images.length}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-brand-blue">{roomName}</p>
                        {roomType.price > 0 && (
                          <p className="shrink-0 text-end">
                            <span className="font-extrabold text-brand-orange">
                              {t.accommodationCard.currency(roomType.price)}
                            </span>{" "}
                            <span className="text-xs text-neutral-500">{t.accommodationCard.perNight}</span>
                          </p>
                        )}
                      </div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                        <i className="fi fi-sr-user text-brand-orange" aria-hidden="true" />
                        {t.accommodationCard.capacity(roomType.capacity)}
                      </p>
                      {roomDescription && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">{roomDescription}</p>
                      )}
                      <span className="mt-auto pt-1 text-sm font-bold text-brand-orange">
                        {t.accommodationDetail.roomDetails} <span className="inline-block rtl:-scale-x-100">→</span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        )}

        <div className="mt-6 border-t border-black/5 pt-6 pb-6">
          <h2 className="mb-4 text-lg font-bold text-brand-blue">
            {t.accommodationDetail.amenitiesHeading}
          </h2>
          <ul className="flex flex-col gap-3">
            {item.hasPool && (
              <li className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <AmenityIcon text={t.accommodationCard.pool} /> {t.accommodationCard.pool}
              </li>
            )}
            {item.hasGarden && (
              <li className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <AmenityIcon text={t.accommodationCard.garden} /> {t.accommodationCard.garden}
              </li>
            )}
            {amenities.map((amenity) => (
              <li key={amenity} className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <AmenityIcon text={amenity} /> {amenity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {openRoom !== null && item.roomTypes[openRoom] && (
        <RoomDialog
          room={item.roomTypes[openRoom]}
          hotelName={name}
          onClose={() => setOpenRoom(null)}
        />
      )}

      <div className="sticky bottom-0 z-30 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <WhatsAppButton message={t.inquiry(name)} className="w-full py-3.5 text-base" />
      </div>
    </div>
  );
}
