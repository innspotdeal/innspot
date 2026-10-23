"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { PublicAddon } from "@/lib/program-addons";

// صفحة «الصور والتفاصيل» لإضافة في برنامج الشركات (المالك، 2026-10-24):
// الصور والوصف بس، من غير سعر — السعر بيتحسب في الحاسبة. وزرار يضيفها للرحلة
// ويرجّع العميل للبرنامج زي ما ساب اختياراته.
export default function AddonDetails({
  addon,
  isEn,
  selected,
  onAdd,
  onClose,
  labels,
}: {
  addon: PublicAddon;
  isEn: boolean;
  selected: boolean;
  onAdd: () => void;
  onClose: () => void;
  labels: { close: string; add: string; added: string; included: string; photo: string };
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const name = isEn ? addon.nameEn || addon.name : addon.name;
  const description = isEn ? addon.descriptionEn || addon.description : addon.description;

  // الصفحة فوق البرنامج: اللي وراها مش بيتحرك، وEsc بيقفلها
  useEffect(() => {
    closeRef.current?.focus();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="addon-details-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden bg-white sm:max-h-[90vh] sm:max-w-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <h2 id="addon-details-title" className="text-lg font-extrabold text-neutral-900">
            {name}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 fill-current">
              <path d="M5.3 4.2 10 8.9l4.7-4.7 1.1 1.1-4.7 4.7 4.7 4.7-1.1 1.1-4.7-4.7-4.7 4.7-1.1-1.1 4.7-4.7-4.7-4.7z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {addon.images.length > 0 && (
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pt-5">
              {addon.images.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-neutral-100 sm:w-[75%]"
                >
                  <Image
                    src={src}
                    alt={`${name} — ${labels.photo} ${index + 1}`}
                    fill
                    sizes="(min-width: 640px) 420px, 85vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
          {description && (
            <p className="whitespace-pre-line px-5 py-5 text-base leading-relaxed text-neutral-700">{description}</p>
          )}
        </div>

        <div className="border-t border-neutral-100 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {addon.included ? (
            <p className="text-center text-sm font-bold text-brand-blue">{labels.included}</p>
          ) : selected ? (
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand-blue/10 px-6 text-base font-bold text-brand-blue"
            >
              {labels.added}
            </button>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand-orange px-6 text-base font-extrabold text-white shadow-lg transition hover:bg-brand-orange-dark"
            >
              {labels.add}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
