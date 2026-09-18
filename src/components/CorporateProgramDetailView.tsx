"use client";

import { useRouter } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import WhatsAppButton from "@/components/WhatsAppButton";
import BookingForm from "@/components/BookingForm";
import CheckIcon from "@/components/CheckIcon";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { CorporateProgram } from "@/data/programs";

export default function CorporateProgramDetailView({
  program,
  programs,
}: {
  program: CorporateProgram;
  programs: CorporateProgram[];
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];

  const name = lang === "en" ? program.nameEn : program.name;
  const description = lang === "en" ? program.descriptionEn : program.description;
  const duration = lang === "en" ? program.durationEn : program.duration;
  const includes = lang === "en" ? program.includesEn : program.includes;

  // "07:00" → "7:00 ص" بالعربي / "7:00 AM" بالإنجليزي
  const formatTime = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return value;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const minutes = String(m).padStart(2, "0");
    const suffix = lang === "en" ? (h < 12 ? "AM" : "PM") : h < 12 ? "ص" : "م";
    return `${hour12}:${minutes} ${suffix}`;
  };

  const hasTimes = Boolean(program.startTime && program.endTime);

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

        {program.itinerary.length > 0 && (
          <div className="mt-6 border-t border-black/5 pt-6">
            <h2 className="mb-4 text-lg font-bold text-brand-blue">
              {t.programSection.highlightsHeading}
            </h2>

            {hasTimes && (
              <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm">
                <span className="font-semibold text-neutral-500">
                  {t.programSection.startTimeLabel}{" "}
                  <span className="font-extrabold text-brand-orange">
                    {formatTime(program.startTime)}
                  </span>
                </span>
                <span className="font-semibold text-neutral-500">
                  {t.programSection.endTimeLabel}{" "}
                  <span className="font-extrabold text-brand-orange">
                    {formatTime(program.endTime)}
                  </span>
                </span>
              </div>
            )}

            {/* تايم لاين رأسي: نقطة لكل خطوة + خط واصل بينهم */}
            <ol className="relative flex flex-col">
              {program.itinerary.map((stepItem, index) => {
                const title = lang === "en" ? stepItem.titleEn : stepItem.title;
                const detail = lang === "en" ? stepItem.detailEn : stepItem.detail;
                const isLast = index === program.itinerary.length - 1;

                return (
                  <li key={`${title}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-orange" />
                      {!isLast && <span className="mt-1 w-px flex-1 bg-black/10" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-neutral-800">{title}</p>
                      {detail && (
                        <p className="mt-1 text-sm leading-relaxed text-neutral-500">{detail}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
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

      {!program.isCustom && (
        <div id="booking" className="relative z-10 bg-white px-4 pt-8 sm:px-8">
          <BookingForm programs={programs} initialProgramId={program.id} />
        </div>
      )}

      {/* زرار الواتساب تحت الحاسبة */}
      <div className="relative z-10 bg-white px-4 py-6 sm:px-8">
        <WhatsAppButton
          message={t.inquiry(name)}
          label={t.programDetail.inquiryLabel}
          className="w-full py-3.5 text-base"
        />
      </div>
    </div>
  );
}
