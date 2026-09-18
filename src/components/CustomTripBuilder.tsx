"use client";

import { useMemo, useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLanguage } from "@/lib/language-context";
import type { CustomTripOption } from "@/data/custom-trip";

type Props = { options: CustomTripOption[] };

const MIN_PEOPLE = 1;

export default function CustomTripBuilder({ options }: Props) {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const t = (ar: string, en: string) => (isEn ? en : ar);

  const [people, setPeople] = useState("20");
  const [stayKind, setStayKind] = useState<"day_use" | "overnight">("day_use");
  const [nights, setNights] = useState("1");
  const [hotelId, setHotelId] = useState("");
  const [breakfastPlaceId, setBreakfastPlaceId] = useState("");
  const [breakfastItemIds, setBreakfastItemIds] = useState<string[]>([]);
  const [carId, setCarId] = useState("");
  const [lunchPlaceId, setLunchPlaceId] = useState("");
  const [lunchItemIds, setLunchItemIds] = useState<string[]>([]);
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const byKind = useMemo(() => {
    const map: Record<string, CustomTripOption[]> = {};
    for (const o of options) (map[o.kind] ??= []).push(o);
    return map;
  }, [options]);

  const find = (id: string) => options.find((o) => o.id === id);
  const label = (o: CustomTripOption) => (isEn ? o.nameEn || o.name : o.name);

  const peopleCount = Math.max(MIN_PEOPLE, Number(people) || 0);
  const nightCount = stayKind === "overnight" ? Math.max(1, Number(nights) || 1) : 0;
  const hotel = find(hotelId);

  // فطار اليوم التاني بيجي من الفندق لما يكون شامل فطار
  const secondDayBreakfastIncluded = stayKind === "overnight" && Boolean(hotel?.includesBreakfast);

  const breakfastItems = (byKind.breakfast_item ?? []).filter((o) => o.parentId === breakfastPlaceId);
  const lunchItems = (byKind.lunch_item ?? []).filter((o) => o.parentId === lunchPlaceId);

  // حساب سعر خيار واحد حسب أساس تسعيره
  function lineTotal(o: CustomTripOption): number {
    switch (o.priceUnit) {
      case "per_person":
        return o.price * peopleCount;
      case "per_night":
        return o.price * peopleCount * nightCount;
      case "per_car":
        return o.capacity > 0 ? Math.ceil(peopleCount / o.capacity) * o.price : o.price;
      case "flat":
        return o.price;
    }
  }

  const lines = useMemo(() => {
    const picked: { option: CustomTripOption; total: number; note?: string }[] = [];

    if (stayKind === "overnight" && hotel) {
      picked.push({
        option: hotel,
        total: lineTotal(hotel),
        note: hotel.includesBreakfast ? t("شامل فطار اليوم التاني", "day-two breakfast included") : undefined,
      });
    }

    const bfPlace = find(breakfastPlaceId);
    if (bfPlace && bfPlace.price > 0) picked.push({ option: bfPlace, total: lineTotal(bfPlace) });
    for (const id of breakfastItemIds) {
      const o = find(id);
      if (o) picked.push({ option: o, total: lineTotal(o) });
    }

    const car = find(carId);
    if (car) picked.push({ option: car, total: lineTotal(car) });

    const lnPlace = find(lunchPlaceId);
    if (lnPlace && lnPlace.price > 0) picked.push({ option: lnPlace, total: lineTotal(lnPlace) });
    for (const id of lunchItemIds) {
      const o = find(id);
      if (o) picked.push({ option: o, total: lineTotal(o) });
    }

    for (const id of addonIds) {
      const o = find(id);
      if (o) picked.push({ option: o, total: lineTotal(o) });
    }

    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options,
    stayKind,
    hotelId,
    nights,
    people,
    breakfastPlaceId,
    breakfastItemIds,
    carId,
    lunchPlaceId,
    lunchItemIds,
    addonIds,
    isEn,
  ]);

  const total = lines.reduce((sum, l) => sum + l.total, 0);
  const perPerson = peopleCount > 0 ? Math.ceil(total / peopleCount) : 0;
  const fmt = (n: number) => n.toLocaleString("en-US");

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const summaryText = [
    t("طلب برنامج كاستم", "Custom program request"),
    `${t("عدد الأفراد", "People")}: ${peopleCount}`,
    stayKind === "overnight"
      ? `${t("مبيت", "Overnight")}: ${nightCount} ${t("ليلة", "night(s)")}${hotel ? ` — ${label(hotel)}` : ""}`
      : t("داي يوز", "Day use"),
    ...lines.map((l) => `- ${label(l.option)}: ${fmt(l.total)} EGP`),
    `${t("الإجمالي", "Total")}: ${fmt(total)} EGP`,
    `${t("للفرد", "Per person")}: ${fmt(perPerson)} EGP`,
  ].join("\n");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="flex flex-col gap-5">
        {/* عدد الأفراد ونوع الإقامة */}
        <Card step="1" title={t("الأساسيات", "The basics")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("عدد الأفراد", "Number of people")}</Label>
              <input
                type="number"
                min={MIN_PEOPLE}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <Label>{t("نوع الرحلة", "Trip type")}</Label>
              <div className="mt-1 flex gap-2">
                <Choice active={stayKind === "day_use"} onClick={() => setStayKind("day_use")}>
                  {t("داي يوز", "Day use")}
                </Choice>
                <Choice active={stayKind === "overnight"} onClick={() => setStayKind("overnight")}>
                  {t("مبيت", "Overnight")}
                </Choice>
              </div>
            </div>
          </div>

          {stayKind === "overnight" && (
            <div className="mt-4">
              <Label>{t("عدد الليالي", "Nights")}</Label>
              <input
                type="number"
                min={1}
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                className="mt-1 w-full max-w-[160px] rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </div>
          )}
        </Card>

        {/* المبيت */}
        {stayKind === "overnight" && (
          <Card step="2" title={t("مكان المبيت", "Where you'll stay")}>
            <div className="flex flex-col gap-2">
              {(byKind.hotel ?? []).map((o) => (
                <OptionRow
                  key={o.id}
                  selected={hotelId === o.id}
                  onClick={() => setHotelId(hotelId === o.id ? "" : o.id)}
                  title={label(o)}
                  meta={[o.tier, o.includesBreakfast ? t("شامل فطار", "breakfast included") : ""]
                    .filter(Boolean)
                    .join(" · ")}
                  price={`${fmt(o.price)} ${t("ج/فرد/ليلة", "EGP/person/night")}`}
                />
              ))}
            </div>
          </Card>
        )}

        {/* الفطار */}
        <Card
          step={stayKind === "overnight" ? "3" : "2"}
          title={t("الفطار", "Breakfast")}
          hint={
            secondDayBreakfastIncluded
              ? t("فطار اليوم التاني مشمول في الفندق", "Day-two breakfast is included with the hotel")
              : undefined
          }
        >
          <div className="flex flex-col gap-2">
            {(byKind.breakfast_place ?? []).map((o) => (
              <OptionRow
                key={o.id}
                selected={breakfastPlaceId === o.id}
                onClick={() => {
                  setBreakfastPlaceId(breakfastPlaceId === o.id ? "" : o.id);
                  setBreakfastItemIds([]);
                }}
                title={label(o)}
                meta={o.tier}
                price={o.price > 0 ? `${fmt(o.price)} ${t("ج/فرد", "EGP/person")}` : ""}
              />
            ))}
          </div>

          {breakfastPlaceId && breakfastItems.length > 0 && (
            <div className="mt-4 border-t border-black/5 pt-4">
              <Label>{t("اختار الأصناف", "Pick the dishes")}</Label>
              <div className="mt-2 flex flex-col gap-2">
                {breakfastItems.map((o) => (
                  <OptionRow
                    key={o.id}
                    selected={breakfastItemIds.includes(o.id)}
                    onClick={() => toggle(breakfastItemIds, setBreakfastItemIds, o.id)}
                    title={label(o)}
                    price={`${fmt(o.price)} ${t("ج/فرد", "EGP/person")}`}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* السفاري */}
        <Card step={stayKind === "overnight" ? "4" : "3"} title={t("رحلة السفاري", "The safari")}>
          <Label>{t("عربية السفاري", "Safari vehicle")}</Label>
          <div className="mt-2 flex flex-col gap-2">
            {(byKind.safari_car ?? []).map((o) => {
              const cars = o.capacity > 0 ? Math.ceil(peopleCount / o.capacity) : 1;
              return (
                <OptionRow
                  key={o.id}
                  selected={carId === o.id}
                  onClick={() => setCarId(carId === o.id ? "" : o.id)}
                  title={label(o)}
                  meta={t(`${cars} عربية للعدد ده`, `${cars} vehicle(s) for this group`)}
                  price={`${fmt(o.price)} ${t("ج/عربية", "EGP/vehicle")}`}
                />
              );
            })}
          </div>
        </Card>

        {/* الغداء */}
        <Card step={stayKind === "overnight" ? "5" : "4"} title={t("الغداء", "Lunch")}>
          <div className="flex flex-col gap-2">
            {(byKind.lunch_place ?? []).map((o) => (
              <OptionRow
                key={o.id}
                selected={lunchPlaceId === o.id}
                onClick={() => {
                  setLunchPlaceId(lunchPlaceId === o.id ? "" : o.id);
                  setLunchItemIds([]);
                }}
                title={label(o)}
                meta={o.tier}
                price={o.price > 0 ? `${fmt(o.price)} ${t("ج/فرد", "EGP/person")}` : ""}
              />
            ))}
          </div>

          {lunchPlaceId && lunchItems.length > 0 && (
            <div className="mt-4 border-t border-black/5 pt-4">
              <Label>{t("اختار الأصناف", "Pick the dishes")}</Label>
              <div className="mt-2 flex flex-col gap-2">
                {lunchItems.map((o) => (
                  <OptionRow
                    key={o.id}
                    selected={lunchItemIds.includes(o.id)}
                    onClick={() => toggle(lunchItemIds, setLunchItemIds, o.id)}
                    title={label(o)}
                    price={`${fmt(o.price)} ${t("ج/فرد", "EGP/person")}`}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* الإضافات */}
        <Card step={stayKind === "overnight" ? "6" : "5"} title={t("الإضافات", "Extras")}>
          <div className="flex flex-col gap-2">
            {(byKind.addon ?? []).map((o) => (
              <OptionRow
                key={o.id}
                selected={addonIds.includes(o.id)}
                onClick={() => toggle(addonIds, setAddonIds, o.id)}
                title={label(o)}
                price={
                  o.priceUnit === "flat"
                    ? `${fmt(o.price)} ${t("ج", "EGP")}`
                    : `${fmt(o.price)} ${t("ج/فرد", "EGP/person")}`
                }
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ملخص السعر */}
      <div className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-brand-blue">{t("ملخص رحلتك", "Your trip")}</h3>

          {lines.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">
              {t("ابدأ تختار وهتلاقي السعر بيتحدّث هنا.", "Start choosing and the price will update here.")}
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 border-b border-black/5 pb-4">
              {lines.map((l, i) => (
                <li key={`${l.option.id}-${i}`} className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 text-neutral-600">
                    {label(l.option)}
                    {l.note && <span className="block text-xs text-neutral-400">{l.note}</span>}
                  </span>
                  <span className="shrink-0 font-semibold text-neutral-800">{fmt(l.total)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-500">{t("الإجمالي", "Total")}</span>
            <span className="text-2xl font-extrabold text-brand-orange">
              {fmt(total)} {t("ج", "EGP")}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-500">{t("للفرد", "Per person")}</span>
            <span className="text-base font-extrabold text-brand-blue">
              {fmt(perPerson)} {t("ج", "EGP")}
            </span>
          </div>

          <div className="mt-5">
            <WhatsAppButton
              message={summaryText}
              label={t("ابعت الطلب على واتساب", "Send on WhatsApp")}
              className="w-full py-3 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange text-sm font-bold text-white">
          {step}
        </span>
        <h2 className="text-lg font-extrabold text-brand-blue">{title}</h2>
      </div>
      {hint && <p className="mb-3 text-xs font-semibold text-brand-orange">{hint}</p>}
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-neutral-700">{children}</label>;
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
        active
          ? "border-brand-blue bg-brand-blue text-white"
          : "border-neutral-300 text-neutral-600 hover:border-brand-blue"
      }`}
    >
      {children}
    </button>
  );
}

function OptionRow({
  selected,
  onClick,
  title,
  meta,
  price,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  meta?: string;
  price?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition ${
        selected ? "border-brand-orange bg-orange-50" : "border-neutral-200 hover:border-brand-blue"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-neutral-800">{title}</span>
        {meta && <span className="block text-xs text-neutral-500">{meta}</span>}
      </span>
      {price && <span className="shrink-0 text-sm font-bold text-brand-orange">{price}</span>}
    </button>
  );
}
