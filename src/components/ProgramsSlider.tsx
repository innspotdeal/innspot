"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { CorporateProgram } from "@/data/programs";

const SWIPE_THRESHOLD = 50;

function ChevronIcon({ direction }: { direction: "prev" | "next" }) {
  const d = direction === "next" ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d={d} />
    </svg>
  );
}

export default function ProgramsSlider({
  programs,
  startingPrices = {},
}: {
  programs: CorporateProgram[];
  startingPrices?: Record<string, number>;
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const textDir = lang === "en" ? "ltr" : "rtl";
  const [active, setActive] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goTo = (index: number) => setActive((index + programs.length) % programs.length);

  const program = programs[active];
  const name = lang === "en" ? program.nameEn : program.name;
  const description = lang === "en" ? program.descriptionEn : program.description;
  const duration = lang === "en" ? program.durationEn : program.duration;
  const startingPrice = startingPrices[program.id];

  return (
    <div
      dir="ltr"
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > SWIPE_THRESHOLD) goTo(active + (delta < 0 ? 1 : -1));
        setTouchStartX(null);
      }}
      className="relative mx-auto mt-28 w-full max-w-[800px] rounded-[25px] bg-white p-6 shadow-[0px_14px_80px_rgba(241,90,37,0.25)] sm:mt-32 sm:p-8 md:mt-0 md:h-[400px]"
    >
      <div
        key={program.id}
        className="flex flex-col items-center gap-6 [animation:slide-fade-in_0.5s_ease] md:h-full md:flex-row md:gap-10"
      >
        <div className="relative h-[220px] w-[90%] shrink-0 -translate-y-1/2 overflow-hidden rounded-[20px] bg-gradient-to-br from-trip-yellow to-brand-orange shadow-[4px_13px_30px_1px_rgba(241,90,37,0.3)] sm:h-[260px] md:h-[300px] md:w-[300px] md:translate-y-0 md:-translate-x-16">
          <Image src={program.images[0]} alt={name} fill sizes="(min-width: 768px) 300px, 100vw" className="object-cover" />

          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label={lang === "en" ? "Previous program" : "البرنامج السابق"}
            className="absolute start-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#0d0925] shadow-md transition hover:bg-white"
          >
            <ChevronIcon direction="prev" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label={lang === "en" ? "Next program" : "البرنامج التالي"}
            className="absolute end-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#0d0925] shadow-md transition hover:bg-white"
          >
            <ChevronIcon direction="next" />
          </button>
        </div>

        <div
          dir={textDir}
          className="-mt-14 flex min-w-0 flex-1 flex-col items-center px-2 text-center sm:-mt-16 md:mt-0 md:items-start md:px-0 md:pr-16 md:text-start"
        >
          <span className="mb-3 line-clamp-1 font-medium text-[#7b7992]">{duration}</span>
          <div className="mb-3 line-clamp-2 text-2xl font-bold text-[#0d0925]">{name}</div>
          <p className="mb-4 line-clamp-3 leading-relaxed text-[#4e4a67]">{description}</p>
          <p className="mb-5 text-sm font-extrabold text-brand-orange">
            {startingPrice
              ? t.programCard.startsFrom(startingPrice.toLocaleString("en-US"))
              : t.programCard.customPrice}
          </p>
          <Link
            href={`/corporate-trips/${program.id}`}
            className="inline-flex justify-center rounded-full bg-gradient-to-br from-trip-yellow to-brand-orange px-9 py-4 font-medium tracking-wide text-white shadow-[0px_14px_80px_rgba(241,90,37,0.35)] max-md:w-full"
          >
            {t.programCard.fullDetails}
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 md:absolute md:end-8 md:top-1/2 md:mt-0 md:flex-col md:-translate-y-1/2">
        {programs.map((p, index) => (
          <button
            key={p.id}
            type="button"
            aria-label={lang === "en" ? p.nameEn : p.name}
            aria-current={index === active}
            onClick={() => goTo(index)}
            className={`cursor-pointer rounded-full transition-all duration-300 ${
              index === active
                ? "h-[11px] w-[30px] bg-brand-orange opacity-100 shadow-[0px_0px_20px_rgba(241,90,37,0.35)] md:h-[30px] md:w-[11px]"
                : "h-[11px] w-[11px] bg-trip-navy opacity-20 hover:opacity-40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
