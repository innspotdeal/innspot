"use client";

import Image from "next/image";
import WhatsAppButton from "@/components/WhatsAppButton";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { Activity } from "@/data/activities";

export default function ActivityFullCard({ item }: { item: Activity }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const name = lang === "en" ? item.nameEn : item.name;
  const description = lang === "en" ? item.descriptionEn : item.description;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
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
        <h3 className="text-lg font-extrabold text-brand-blue">{name}</h3>
        <p className="text-sm leading-relaxed text-neutral-600">{description}</p>

        <div className="mt-auto pt-2">
          <WhatsAppButton message={t.inquiry(name)} className="w-full" />
        </div>
      </div>
    </div>
  );
}
