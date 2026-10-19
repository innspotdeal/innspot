"use client";

import Image from "next/image";
import { useState } from "react";
import ArrowIcon from "@/components/ArrowIcon";

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
            className="absolute inset-y-0 left-2 my-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream/90 shadow-md transition hover:bg-brand-cream"
          >
            <ArrowIcon direction="back" followText={false} className="h-4 w-auto" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label="الصورة التالية"
            className="absolute inset-y-0 right-2 my-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream/90 shadow-md transition hover:bg-brand-cream"
          >
            <ArrowIcon direction="next" followText={false} className="h-4 w-auto" />
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
