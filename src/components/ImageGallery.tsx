"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageGallery({
  images,
  alt,
  aspectClassName = "aspect-[16/9]",
  counterPosition = "center",
}: {
  images: string[];
  alt: string;
  aspectClassName?: string;
  counterPosition?: "center" | "end";
}) {
  const [index, setIndex] = useState(0);

  function showPrev() {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function showNext() {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className={`relative w-full overflow-hidden bg-neutral-100 ${aspectClassName}`}>
      <Image
        src={images[index]}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover"
        priority
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrev}
            aria-label="الصورة السابقة"
            className="absolute inset-y-0 left-2 my-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label="الصورة التالية"
            className="absolute inset-y-0 right-2 my-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>

          <div
            className={`absolute bottom-3 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white ${
              counterPosition === "end" ? "end-3" : "left-1/2 -translate-x-1/2"
            }`}
          >
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
