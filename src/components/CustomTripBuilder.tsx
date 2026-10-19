"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLanguage } from "@/lib/language-context";
import type { CustomTripOption } from "@/data/custom-trip";
import type { Hotel, RoomType } from "@/data/hotels";

type Props = {
  options: CustomTripOption[];
  // المبيت: الفنادق نفسها من صفحة الفنادق، بغرفها وأسعارها
  hotels: Hotel[];
  // إضافات مشمولة في البرنامج — بتتحسب دايمًا ومش بتتشال (بتتحدد من التسعير في الـ ERP)
  includedAddonIds?: string[];
};

const MIN_PEOPLE = 1;

export default function CustomTripBuilder({ options, hotels, includedAddonIds = [] }: Props) {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const t = (ar: string, en: string) => (isEn ? en : ar);

  const [people, setPeople] = useState("20");
  const [stayKind, setStayKind] = useState<"day_use" | "overnight">("day_use");
  const [nights, setNights] = useState("1");
  const [hotelId, setHotelId] = useState("");
  // نوع الغرفة المختار في الفندق (رقمه في قايمة غرف الفندق)
  const [roomIndex, setRoomIndex] = useState<number | null>(null);
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
  const hotel = hotels.find((h) => h.id === hotelId);
  const room = hotel && roomIndex !== null ? hotel.roomTypes[roomIndex] : undefined;
  const hotelName = (h: Hotel) => (isEn ? h.nameEn || h.name : h.name);
  const roomName = (r: RoomType) => (isEn ? r.nameEn || r.name : r.name);
  // عدد الغرف اللي المجموعة محتاجاها من نوع الغرفة ده (20 فرد في غرف مزدوجة = 10 غرف)
  const roomsNeeded = (r: RoomType) => (r.capacity > 0 ? Math.ceil(peopleCount / r.capacity) : 1);
  const fmt = (n: number) => n.toLocaleString("en-US");

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
    const picked: { key: string; name: string; total: number; note?: string }[] = [];
    const add = (o: CustomTripOption) => picked.push({ key: o.id, name: label(o), total: lineTotal(o) });

    if (stayKind === "overnight" && hotel) {
      if (!room) {
        picked.push({ key: hotel.id, name: hotelName(hotel), total: 0, note: t("اختار نوع الغرفة", "Pick a room type") });
      } else {
        const rooms = roomsNeeded(room);
        picked.push({
          key: hotel.id,
          name: `${hotelName(hotel)} — ${roomName(room)}`,
          // الغرفة اللي ملهاش سعر بتتسعّر مع العميل، فمش بتدخل في الإجمالي
          total: room.price * rooms * nightCount,
          note:
            room.price > 0
              ? t(`${rooms} غرفة × ${nightCount} ليلة`, `${rooms} room(s) × ${nightCount} night(s)`)
              : t("سعر المبيت هيتأكد معاك", "The stay will be priced with you"),
        });
      }
    }

    const bfPlace = find(breakfastPlaceId);
    if (bfPlace && bfPlace.price > 0) add(bfPlace);
    for (const id of breakfastItemIds) {
      const o = find(id);
      if (o) add(o);
    }

    const car = find(carId);
    if (car) add(car);

    const lnPlace = find(lunchPlaceId);
    if (lnPlace && lnPlace.price > 0) add(lnPlace);
    for (const id of lunchItemIds) {
      const o = find(id);
      if (o) add(o);
    }

    for (const id of [...includedAddonIds, ...addonIds.filter((a) => !includedAddonIds.includes(a))]) {
      const o = find(id);
      if (o) add(o);
    }

    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options,
    hotels,
    stayKind,
    hotelId,
    roomIndex,
    nights,
    people,
    breakfastPlaceId,
    breakfastItemIds,
    carId,
    lunchPlaceId,
    lunchItemIds,
    addonIds,
    includedAddonIds,
    isEn,
  ]);

  const total = lines.reduce((sum, l) => sum + l.total, 0);
  const perPerson = peopleCount > 0 ? Math.ceil(total / peopleCount) : 0;

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const summaryText = [
    t("طلب برنامج كاستم", "Custom program request"),
    `${t("عدد الأفراد", "People")}: ${peopleCount}`,
    stayKind === "overnight"
      ? `${t("مبيت", "Overnight")}: ${nightCount} ${t("ليلة", "night(s)")}${hotel ? ` — ${hotelName(hotel)}` : ""}${room ? ` (${roomName(room)})` : ""}`
      : t("داي يوز", "Day use"),
    ...lines.map((l) => `- ${l.name}: ${l.total > 0 ? `${fmt(l.total)} EGP` : l.note ?? ""}`),
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

        {/* المبيت: الفنادق من صفحة الفنادق — تختار الفندق وبعدين نوع الغرفة */}
        {stayKind === "overnight" && (
          <Card step="2" title={t("مكان المبيت", "Where you'll stay")}>
            {hotels.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("لسه مفيش فنادق متاحة.", "No hotels yet.")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {hotels.map((h) => {
                  // أرخص سعر للفرد في الليلة في الفندق ده — من الغرف اللي ليها سعر
                  const perHead = h.roomTypes
                    .filter((r) => r.price > 0)
                    .map((r) => Math.ceil(r.price / Math.max(1, r.capacity)));
                  const from = perHead.length ? Math.min(...perHead) : 0;
                  return (
                    <div key={h.id}>
                      <OptionRow
                        selected={hotelId === h.id}
                        onClick={() => {
                          setHotelId(hotelId === h.id ? "" : h.id);
                          setRoomIndex(null);
                        }}
                        title={hotelName(h)}
                        meta={
                          from > 0
                            ? t(`من ${fmt(from)} ج للفرد في الليلة`, `From EGP ${fmt(from)} per person a night`)
                            : t("السعر بيتأكد معاك", "Priced on request")
                        }
                        description={isEn ? h.descriptionEn || h.description : h.description}
                        images={h.images}
                        detailsLabel={t("تفاصيل", "Details")}
                        isEn={isEn}
                      />

                      {hotelId === h.id && h.roomTypes.length > 0 && (
                        <div className="mt-2 ms-4 flex flex-col gap-2 border-s-2 border-brand-orange/30 ps-3">
                          <Label>{t("نوع الغرفة", "Room type")}</Label>
                          {h.roomTypes.map((r, i) => (
                            <OptionRow
                              key={`${r.name}-${i}`}
                              selected={roomIndex === i}
                              onClick={() => setRoomIndex(roomIndex === i ? null : i)}
                              title={roomName(r)}
                              meta={
                                r.price > 0
                                  ? t(
                                      `لـ ${r.capacity} فرد · ${fmt(r.price)} ج الليلة · ${roomsNeeded(r)} غرفة للعدد ده`,
                                      `Sleeps ${r.capacity} · EGP ${fmt(r.price)} a night · ${roomsNeeded(r)} room(s) for this group`
                                    )
                                  : t(`لـ ${r.capacity} فرد · السعر بيتأكد معاك`, `Sleeps ${r.capacity} · priced on request`)
                              }
                              description={isEn ? r.descriptionEn || r.description : r.description}
                              images={r.images}
                              detailsLabel={t("تفاصيل", "Details")}
                              isEn={isEn}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* الفطار */}
        <Card
          step={stayKind === "overnight" ? "3" : "2"}
          title={t("الفطار", "Breakfast")}
        >
          <div className="flex flex-col gap-2">
            {(byKind.breakfast_place ?? []).map((o) => (
              <OptionRow
                key={o.id}
                option={o}
                detailsLabel={t("تفاصيل", "Details")}
                isEn={isEn}
                selected={breakfastPlaceId === o.id}
                onClick={() => {
                  setBreakfastPlaceId(breakfastPlaceId === o.id ? "" : o.id);
                  setBreakfastItemIds([]);
                }}
                title={label(o)}
                meta={o.tier}
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
                    option={o}
                  detailsLabel={t("تفاصيل", "Details")}
                  isEn={isEn}
                  title={label(o)}
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
                  option={o}
                  detailsLabel={t("تفاصيل", "Details")}
                  isEn={isEn}
                  title={label(o)}
                  meta={t(`${cars} عربية للعدد ده`, `${cars} vehicle(s) for this group`)}
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
                option={o}
                detailsLabel={t("تفاصيل", "Details")}
                isEn={isEn}
                selected={lunchPlaceId === o.id}
                onClick={() => {
                  setLunchPlaceId(lunchPlaceId === o.id ? "" : o.id);
                  setLunchItemIds([]);
                }}
                title={label(o)}
                meta={o.tier}
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
                    option={o}
                  detailsLabel={t("تفاصيل", "Details")}
                  isEn={isEn}
                  title={label(o)}
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
                option={o}
                detailsLabel={t("تفاصيل", "Details")}
                isEn={isEn}
                selected={includedAddonIds.includes(o.id) || addonIds.includes(o.id)}
                onClick={() => {
                  if (!includedAddonIds.includes(o.id)) toggle(addonIds, setAddonIds, o.id);
                }}
                title={label(o)}
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
                <li key={`${l.key}-${i}`} className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 text-neutral-600">
                    {l.name}
                    {l.note && <span className="block text-xs text-neutral-400">{l.note}</span>}
                  </span>
                  <span className="shrink-0 font-semibold text-neutral-800">{l.total > 0 ? fmt(l.total) : "—"}</span>
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
  option,
  title,
  meta,
  description: descriptionProp,
  images: imagesProp,
  detailsLabel,
  isEn,
}: {
  selected: boolean;
  onClick: () => void;
  option?: CustomTripOption;
  title: string;
  meta?: string;
  // للفنادق والغرف: الوصف والصور بييجوا من صفحة الفنادق مش من خيار كاستم
  description?: string;
  images?: string[];
  detailsLabel: string;
  isEn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const description =
    descriptionProp ?? (option ? (isEn ? option.descriptionEn || option.description : option.description) : "");
  const images = imagesProp ?? option?.images ?? [];
  const rating = option?.rating ?? 0;
  const hasDetails = Boolean(description || images.length > 0 || rating > 0);

  return (
    <div
      className={`rounded-xl border transition ${
        selected ? "border-brand-orange bg-orange-50" : "border-neutral-200"
      }`}
    >
      <div className="flex items-center gap-2 px-2">
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 text-start"
        >
          <span className="min-w-0">
            <span className="block text-sm font-bold text-neutral-800">{title}</span>
            {meta && <span className="block text-xs text-neutral-500">{meta}</span>}
            {rating > 0 && <Stars rating={rating} />}
          </span>
        </button>

        {hasDetails && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-brand-blue hover:text-brand-blue"
          >
            {detailsLabel}
          </button>
        )}
      </div>

      {open && hasDetails && (
        <div className="border-t border-black/5 px-4 py-3">
          {images.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
                >
                  <Image src={src} alt={title} fill sizes="160px" className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}
          {description && <p className="text-sm leading-relaxed text-neutral-600">{description}</p>}
        </div>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="mt-1 flex items-center gap-1" dir="ltr">
      <span className="text-xs font-bold text-amber-500">
        {"\u2605".repeat(Math.floor(rounded))}
        {rounded % 1 ? "\u00bd" : ""}
      </span>
      <span className="text-[11px] text-neutral-400">{rating.toFixed(1)}</span>
    </span>
  );
}
