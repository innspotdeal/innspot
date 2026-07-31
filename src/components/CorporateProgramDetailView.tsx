"use client";

import { useRouter } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import WhatsAppButton from "@/components/WhatsAppButton";
import BookingForm from "@/components/BookingForm";
import CheckIcon from "@/components/CheckIcon";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { CorporateProgram } from "@/data/programs";

export default function CorporateProgramDetailView({ program }: { program: CorporateProgram }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];

  const name = lang === "en" ? program.nameEn : program.name;
  const description = lang === "en" ? program.descriptionEn : program.description;
  const duration = lang === "en" ? program.durationEn : program.duration;
  const highlights = lang === "en" ? program.highlightsEn : program.highlights;
  const includes = lang === "en" ? program.includesEn : program.includes;

  return (
    <div className="mx-auto max-w-4xl pt-4 sm:pt-6">
      <div className="sticky top-0 z-0 h-[55vh] sm:h-[60vh] sm:overflow-hidden sm:rounded-3xl">
        <ImageGallery
          images={program.images}
          alt={name}
          aspectClassName="h-full"
          counterPosition="end"
        />
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t.programDetail.back}
          className="absolute start-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current rtl:-scale-x-100">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 -mt-6 rounded-t-3xl bg-white px-4 pt-6 pb-6 shadow-[0_-12px_24px_-8px_rgba(0,0,0,0.08)] sm:px-8">
        <h1 className="text-2xl font-extrabold text-brand-blue sm:text-3xl">{name}</h1>
        <p className="mt-2 text-sm font-medium text-neutral-500">{duration}</p>

        <div className="mt-6 border-t border-black/5 pt-6">
          <p className="leading-relaxed text-neutral-600">{description}</p>
        </div>

        {highlights.length > 0 && (
          <div className="mt-6 border-t border-black/5 pt-6">
            <h2 className="mb-4 text-lg font-bold text-brand-blue">
              {t.programSection.highlightsHeading}
            </h2>
            <ul className="flex flex-col gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                  <CheckIcon /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {includes.length > 0 && (
          <div className="mt-6 border-t border-black/5 pt-6">
            <h2 className="mb-4 text-lg font-bold text-brand-blue">
              {t.programSection.includesHeading}
            </h2>
            <ul className="flex flex-col gap-3">
              {includes.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                  <CheckIcon /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-30 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <WhatsAppButton
          message={t.inquiry(name)}
          label={t.programDetail.inquiryLabel}
          className="w-full py-3.5 text-base"
        />
      </div>

      {!program.isCustom && (
        <div id="booking" className="relative z-10 bg-white px-4 pt-8 sm:px-8">
          <BookingForm initialProgramId={program.id} />
        </div>
      )}
    </div>
  );
}
