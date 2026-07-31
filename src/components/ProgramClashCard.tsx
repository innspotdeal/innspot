"use client";

import Image from "next/image";
import Link from "next/link";
import { MIN_PEOPLE } from "@/data/booking";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { CorporateProgram } from "@/data/programs";

// لون مميز لكل برنامج (زي ما كل وحدة في التصميم الأصلي ليها لونها)
// color = لون شريط الإحصائيات، border = لون الفواصل بينها (نفس اللون أغمق شوية)
const CARD_THEMES = [
  { color: "#f15a25", border: "#c9481c" },
  { color: "#0049af", border: "#003a8c" },
  { color: "#ec9b3b", border: "#bd7c2f" },
  { color: "#2f9e8f", border: "#268275" },
  { color: "#6b4fbb", border: "#573f99" },
];

export default function ProgramClashCard({
  program,
  index,
}: {
  program: CorporateProgram;
  index: number;
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  const name = lang === "en" ? program.nameEn : program.name;
  const description = lang === "en" ? program.descriptionEn : program.description;
  const duration = lang === "en" ? program.durationEn : program.duration;
  const highlights = lang === "en" ? program.highlightsEn : program.highlights;
  const includes = lang === "en" ? program.includesEn : program.includes;

  // برنامج إليت مخصص بالكامل، فمفيش محطات/مشمولات ثابتة يتعرض عددها
  const stats = [
    {
      value: program.isCustom ? t.programCard.statCustom : String(highlights.length),
      label: t.programCard.statStops,
    },
    {
      value: program.isCustom ? t.programCard.statCustom : String(includes.length),
      label: t.programCard.statIncludes,
    },
    { value: String(MIN_PEOPLE), label: t.programCard.statMinPeople },
  ];

  return (
    <Link
      href={`/corporate-trips/${program.id}`}
      className="mx-auto flex h-full w-full max-w-[300px] flex-col overflow-hidden rounded-[19px] bg-white text-center shadow-[-1px_15px_30px_-12px_black] transition hover:-translate-y-1"
    >
      <div className="relative h-[230px] w-full shrink-0 bg-neutral-100">
        <Image
          src={program.images[0]}
          alt={name}
          fill
          sizes="300px"
          className="object-cover"
        />
      </div>

      <div className="mt-[35px]">
        <div
          className="mb-[3px] text-xs font-bold tracking-wide uppercase"
          style={{ color: theme.color }}
        >
          {duration}
        </div>
        <div className="mb-[5px] px-4 text-[26px] leading-tight font-black text-black">{name}</div>
        <p className="mb-2.5 p-5 text-[#9e9e9e]">{description}</p>
      </div>

      <div className="mt-auto flex font-bold text-white" style={{ backgroundColor: theme.color }}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`w-1/3 px-[15px] py-5 ${i < stats.length - 1 ? "border-e" : ""}`}
            style={i < stats.length - 1 ? { borderColor: theme.border } : undefined}
          >
            <div className="mb-2.5 text-2xl">{stat.value}</div>
            <div className="text-xs font-normal uppercase">{stat.label}</div>
          </div>
        ))}
      </div>
    </Link>
  );
}
