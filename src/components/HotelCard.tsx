"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import type { Hotel } from "@/data/hotels";

export default function HotelCard({ item }: { item: Hotel }) {
  const { lang } = useLanguage();
  const name = lang === "en" ? item.nameEn : item.name;

  return (
    <Link href={`/accommodation/${item.id}`} className="block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={item.images[0]}
          alt={name}
          fill
          sizes="(max-width: 768px) 60vw, 260px"
          className="object-cover transition duration-300 hover:scale-105"
        />
      </div>
      <h3 className="mt-3 truncate text-base font-bold text-brand-blue">{name}</h3>
    </Link>
  );
}
