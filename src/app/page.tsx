"use client";

import Link from "next/link";
import { siteConfig } from "@/data/site";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const name = lang === "en" ? siteConfig.nameEn : siteConfig.name;
  const tagline = lang === "en" ? siteConfig.taglineEn : siteConfig.tagline;

  return (
    <div className="relative flex min-h-[calc(100svh-64px)] w-full items-center justify-center overflow-hidden">
      {/* فيديو الخلفية الرئيسي — شغّال تلقائي، صامت، ومكرر
          poster = صورة تظهر لحد ما الفيديو يحمّل (أو لو المتصفح مش هيشغّله) */}
      <video
        src="/images/hero-video.mp4"
        poster="/images/hero.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* طبقة تظليل لجعل النصوص واضحة فوق الصورة */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-6xl">
            {name}
          </h1>
          <p className="mt-4 text-base font-medium text-white/90 drop-shadow sm:text-xl">
            {tagline}
          </p>
        </div>

        <div className="mt-4 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:gap-6">
          <Link
            href="/corporate-trips"
            className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-brand-orange px-8 text-lg font-extrabold text-white shadow-xl transition hover:bg-brand-orange-dark active:scale-[0.98] sm:w-64"
          >
            {t.home.corporateTripsCta}
          </Link>
          <Link
            href="/accommodation"
            className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-brand-blue px-8 text-lg font-extrabold text-white shadow-xl transition hover:bg-brand-blue-dark active:scale-[0.98] sm:w-64"
          >
            {t.home.accommodationCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
