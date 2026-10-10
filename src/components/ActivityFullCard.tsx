"use client";

import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { Activity } from "@/data/activities";

export default function ActivityFullCard({ item }: { item: Activity }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const name = lang === "en" ? item.nameEn : item.name;
  const description = lang === "en" ? item.descriptionEn : item.description;
  const duration = lang === "en" ? item.durationEn || item.duration : item.duration;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/accommodation/${item.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full bg-neutral-100">
          <Image
            src={item.image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-extrabold text-brand-blue">{name}</h3>
            {item.price > 0 && (
              <p className="shrink-0 text-end">
                <span className="font-extrabold text-brand-orange">{t.accommodationCard.currency(item.price)}</span>{" "}
                <span className="text-xs text-neutral-500">{t.accommodationCard.perPerson}</span>
              </p>
            )}
          </div>
          {duration && (
            <span className="w-fit rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
              {duration}
            </span>
          )}
          <p className="text-sm leading-relaxed text-neutral-600">{description}</p>

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
