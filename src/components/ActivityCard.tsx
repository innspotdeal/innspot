"use client";

import Image from "next/image";
import Link from "next/link";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { Activity } from "@/data/activities";

export default function ActivityCard({ item }: { item: Activity }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const name = lang === "en" ? item.nameEn : item.name;

  return (
    <Link href={`/accommodation/${item.id}`} className="block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={item.image}
          alt={name}
          fill
          sizes="(max-width: 768px) 60vw, 260px"
          className="object-cover transition duration-300 hover:scale-105"
        />
      </div>
      <h3 className="mt-3 truncate text-base font-bold text-brand-blue">{name}</h3>
      {item.price > 0 && (
        <p className="mt-1 text-sm">
          <span className="font-extrabold text-brand-orange">{t.accommodationCard.currency(item.price)}</span>{" "}
          <span className="text-xs text-neutral-500">{t.accommodationCard.perPerson}</span>
        </p>
      )}
    </Link>
  );
}
