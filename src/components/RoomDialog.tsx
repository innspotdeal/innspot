"use client";

import { useEffect, useRef } from "react";
import ImageGallery from "@/components/ImageGallery";
import WhatsAppButton from "@/components/WhatsAppButton";
import { translations } from "@/data/translations";
import { useLanguage } from "@/lib/language-context";
import type { RoomType } from "@/data/hotels";

// تفاصيل الغرفة: صورها كلها + السعر والسعة والوصف
// <dialog> الأصلي بيدي زرار Esc وحبس التركيز جواه من غير كود زيادة
// على الموبايل بيطلع من تحت (bottom sheet)، وعلى الشاشات الكبيرة في النص
export default function RoomDialog({
  room,
  hotelName,
  onClose,
}: {
  room: RoomType;
  hotelName: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { lang } = useLanguage();
  const t = translations[lang];

  const roomName = lang === "en" ? room.nameEn || room.name : room.name;
  const description = lang === "en" ? room.descriptionEn || room.description : room.description;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    // الصفحة اللي ورا متتحركش مع السكرول جوه الغرفة
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // الضغط على الخلفية الغامقة (برا المحتوى) بيقفل
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      aria-label={roomName}
      className="mx-auto mt-auto mb-0 max-h-[90dvh] w-full max-w-full overflow-hidden rounded-t-3xl bg-white p-0 shadow-2xl backdrop:bg-black/60 sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      <div className="flex max-h-[90dvh] flex-col">
        <div className="relative shrink-0">
          {room.images.length > 0 ? (
            <ImageGallery
              images={room.images}
              alt={roomName}
              aspectClassName="aspect-[4/3]"
              counterPosition="end"
            />
          ) : (
            <div className="h-14" />
          )}
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label={t.accommodationDetail.closeRoom}
            className="absolute end-3 top-3 z-20 flex size-10 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 pt-5 pb-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold text-brand-blue">{roomName}</h2>
            {room.price > 0 && (
              <p className="shrink-0 text-end">
                <span className="text-lg font-extrabold text-brand-orange">
                  {t.accommodationCard.currency(room.price)}
                </span>{" "}
                <span className="text-xs text-neutral-500">{t.accommodationCard.perNight}</span>
              </p>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-500">{hotelName}</p>

          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <i className="fi fi-sr-user text-brand-orange" aria-hidden="true" />
            {t.accommodationCard.capacity(room.capacity)}
          </p>

          {description && (
            <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-600">{description}</p>
          )}
        </div>

        <div className="shrink-0 border-t border-black/5 px-5 py-4 sm:px-6">
          <WhatsAppButton
            message={t.accommodationDetail.roomInquiry(roomName, hotelName)}
            label={t.accommodationDetail.roomInquiryLabel}
            className="w-full py-3 text-base"
          />
        </div>
      </div>
    </dialog>
  );
}
