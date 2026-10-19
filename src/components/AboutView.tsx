"use client";

import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import ArrowIcon from "@/components/ArrowIcon";
import { aboutContent } from "@/data/about";
import { clients } from "@/data/clients";
import { useLanguage } from "@/lib/language-context";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-extrabold text-brand-blue sm:text-4xl">
      {children}
      <span aria-hidden="true" className="mt-3 block h-1.5 w-14 rounded-full bg-brand-orange-light" />
    </h2>
  );
}

export default function AboutView() {
  const { lang } = useLanguage();
  const c = aboutContent[lang];

  return (
    <div>
      {/* إحنا من هنا */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-[1.3fr_1fr] md:pt-20">
        <div>
          <h1 className="text-4xl leading-tight font-extrabold text-brand-blue sm:text-6xl">
            {c.hero.titleLead} <span className="text-brand-orange">{c.hero.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-700">{c.hero.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton message={c.hero.bookMessage} label={c.hero.bookCta} className="px-7 py-3.5 text-base" />
            <Link
              href="/corporate-trips"
              className="inline-flex items-center justify-center rounded-full border-2 border-brand-blue px-7 py-3 text-base font-bold text-brand-blue transition hover:bg-brand-blue hover:text-white"
            >
              {c.hero.tripsCta}
            </Link>
          </div>
        </div>
        <Image
          src="/brand/logo.png"
          alt=""
          width={640}
          height={744}
          priority
          className="mx-auto w-56 sm:w-72 md:w-full md:max-w-sm"
        />
      </section>

      {/* حكايتنا */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr]">
          <div>
            <SectionHeading>{c.story.heading}</SectionHeading>
            <ol className="mt-8 flex flex-col gap-4">
              {c.story.timeline.map((step) => (
                <li key={step.year} className="rounded-2xl border-s-4 border-brand-orange-light bg-brand-cream p-4">
                  <p className="text-sm font-extrabold text-brand-orange">{step.year}</p>
                  <p className="mt-1 text-lg font-extrabold text-brand-blue">{step.name}</p>
                  <p className="text-sm text-neutral-600">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-neutral-700">
            {c.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* إحنا بنعمل إيه */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading>{c.services.heading}</SectionHeading>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {c.services.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col rounded-3xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-orange text-xl font-extrabold text-white">
                {item.number}
              </span>
              <h3 className="mt-5 text-2xl font-extrabold text-brand-blue">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-neutral-700">{item.text}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-brand-orange">
                {item.linkLabel}
                <ArrowIcon direction="next" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* بالأرقام */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading>{c.stats.heading}</SectionHeading>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {c.stats.items.map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-brand-blue px-4 py-7 text-center">
              <p dir="ltr" className="text-4xl font-extrabold text-brand-cream sm:text-5xl">
                {stat.value.startsWith("+") && <span className="text-brand-orange-light">+</span>}
                {stat.value.replace("+", "")}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/85">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ليه إنسبوت */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading>{c.why.heading}</SectionHeading>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {c.why.items.map((item) => (
              <div key={item.title} className="rounded-3xl bg-brand-cream p-7">
                <h3 className="text-xl font-extrabold text-brand-orange">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-neutral-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* اللي اشتغلنا معاهم — نفس لوجوهات صفحة رحلات الشركات (data/clients.ts) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading>{c.clients.heading}</SectionHeading>
        <ul className="mt-8 flex flex-wrap justify-center gap-4 sm:justify-start">
          {clients.map((client) => (
            <li
              key={client.logo}
              title={client.name}
              className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm sm:size-28"
            >
              <Image src={client.logo} alt={client.name} width={200} height={200} className="size-full object-contain p-4" />
            </li>
          ))}
        </ul>
      </section>

      {/* أسئلة بتتسأل كتير */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <SectionHeading>{c.faq.heading}</SectionHeading>
          <div className="mt-8 flex flex-col gap-3">
            {c.faq.items.map((item) => (
              <details key={item.q} className="group rounded-2xl bg-brand-cream px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-brand-blue [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden="true" className="text-2xl leading-none text-brand-orange transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-neutral-700">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* الـ CTA الأخير */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-[2rem] bg-brand-blue px-6 py-12 text-center sm:px-12">
          <Image src="/brand/icons/about.png" alt="" width={276} height={256} className="mx-auto w-28 sm:w-36" />
          <h2 className="mt-6 text-3xl font-extrabold text-brand-cream sm:text-4xl">{c.cta.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{c.cta.body}</p>
          <WhatsAppButton message={c.cta.message} label={c.cta.button} className="mt-8 px-7 py-3.5 text-base" />
        </div>
      </section>
    </div>
  );
}
