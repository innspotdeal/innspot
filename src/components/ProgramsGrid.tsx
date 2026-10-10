"use client";

import Image from "next/image";
import Link from "next/link";
import { MIN_PEOPLE } from "@/data/booking";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { CorporateProgram } from "@/data/programs";

// لون لكل كارت بالترتيب — كلهم غامقين كفاية إن الكلام الأبيض يتقري عليهم
const ACCENTS = ["#d84a1a", "#183fad", "#0e7c6b", "#7a3fb0", "#a3620a", "#b3245e"];

export default function ProgramsGrid({
  programs,
  startingPrices = {},
}: {
  programs: CorporateProgram[];
  startingPrices?: Record<string, number>;
}) {
  const { lang } = useLanguage();
  const t = translations[lang].programCard;
  const textDir = lang === "en" ? "ltr" : "rtl";

  return (
    // جنب بعض على الشاشات الكبيرة، وتحت بعض على الموبايل
    <div dir={textDir} className="grid grid-cols-1 gap-8 py-6 sm:grid-cols-2 lg:grid-cols-3">
      {programs.map((program, index) => {
        const accent = ACCENTS[index % ACCENTS.length];
        const name = lang === "en" ? program.nameEn : program.name;
        const description = lang === "en" ? program.descriptionEn : program.description;
        const duration = lang === "en" ? program.durationEn : program.duration;
        const startingPrice = startingPrices[program.id];

        const price =
          program.isTicket && program.ticketPrice > 0
            ? { value: program.ticketPrice.toLocaleString("en-US"), label: t.statTicket }
            : startingPrice
              ? { value: startingPrice.toLocaleString("en-US"), label: t.statFrom }
              : { value: t.statCustom, label: t.statCustomPrice };

        const stats = [
          { value: program.itinerary.length || t.statCustom, label: t.statStops },
          { value: program.isTicket || program.isBuilder ? 1 : MIN_PEOPLE, label: t.statMinPeople },
          price,
        ];

        return (
          <Link
            key={program.id}
            href={`/corporate-trips/${program.id}`}
            className="group flex flex-col overflow-hidden rounded-[19px] bg-white text-center shadow-[-1px_15px_30px_-12px_rgba(0,0,0,0.45)] transition-[translate] duration-300 hover:-translate-y-1.5"
          >
            <div className="relative h-[230px] shrink-0 overflow-hidden">
              <Image
                src={program.images[0]}
                alt={name}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-[scale] duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <div className="flex flex-1 flex-col px-5 pt-6">
              <div className="text-xs font-bold tracking-wide uppercase" style={{ color: accent }}>
                {duration || " "}
              </div>
              <h3 className="mt-1 line-clamp-2 text-[22px]/8 font-black text-black">{name}</h3>
              <p className="mt-3 line-clamp-3 text-sm/6 text-neutral-500">{description}</p>
              <span className="mt-auto pt-4 pb-5 text-sm font-bold" style={{ color: accent }}>
                {t.fullDetails}
              </span>
            </div>

            <div
              className="grid grid-cols-3 text-white [&>*+*]:border-s [&>*+*]:border-black/15"
              style={{ background: accent }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="px-2 py-5">
                  <div className="text-[22px]/7 font-extrabold">
                    {stat.value}
                    {stat === price && price.value !== t.statCustom && (
                      <sup className="ms-0.5 text-[45%]">{t.currency}</sup>
                    )}
                  </div>
                  <div className="mt-1.5 text-xs font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
