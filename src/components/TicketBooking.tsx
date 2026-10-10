"use client";

import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";

const MAX_TICKETS = 50;

// برنامج التذاكر: سعر ثابت للفرد × عدد التذاكر — من غير حاسبة سعر
// النشاط بيستخدم نفس المربع بنصوصه هو (copy="activityBooking")
export default function TicketBooking({
  name,
  ticketPrice,
  copy = "ticketBooking",
}: {
  name: string;
  ticketPrice: number;
  copy?: "ticketBooking" | "activityBooking";
}) {
  const { lang } = useLanguage();
  const t = translations[lang][copy];
  const [tickets, setTickets] = useState(1);

  const total = ticketPrice * tickets;
  const stepButton =
    "flex size-11 items-center justify-center rounded-full border border-neutral-300 text-xl font-bold text-neutral-700 transition hover:border-brand-orange disabled:opacity-40";

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-extrabold text-brand-blue">{t.heading}</h2>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-neutral-50 px-4 py-3">
        <span className="text-sm font-semibold text-neutral-600">{t.pricePerPerson}</span>
        <span className="text-lg font-extrabold text-brand-orange">{t.currency(ticketPrice)}</span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-neutral-800">{t.ticketsLabel}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTickets((n) => Math.max(1, n - 1))}
            disabled={tickets <= 1}
            aria-label={t.decrease}
            className={stepButton}
          >
            −
          </button>
          <span className="min-w-8 text-center text-xl font-extrabold text-neutral-800" aria-live="polite">
            {tickets}
          </span>
          <button
            type="button"
            onClick={() => setTickets((n) => Math.min(MAX_TICKETS, n + 1))}
            disabled={tickets >= MAX_TICKETS}
            aria-label={t.increase}
            className={stepButton}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/5 pt-6">
        <span className="text-base font-bold text-neutral-800">{t.totalLabel}</span>
        <span className="text-2xl font-extrabold text-brand-blue">{t.currency(total)}</span>
      </div>

      <WhatsAppButton
        message={t.whatsappMessage(name, tickets, t.currency(total))}
        label={t.bookCta}
        className="mt-6 w-full py-3.5 text-base"
      />
    </div>
  );
}
