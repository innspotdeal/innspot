"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function ImageUploader({
  images,
  onChange,
  multiple = true,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || "فشل رفع الصورة");
          continue;
        }
        uploaded.push(data.url);
      }

      if (uploaded.length > 0) {
        onChange(multiple ? [...images, ...uploaded] : [uploaded[0]]);
      }
    } catch {
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {multiple && images.length > 1 && (
        <p className="mb-2 text-xs text-neutral-500">
          أول صورة هي اللي بتظهر كصورة غلاف — رتّب الصور بالأسهم زي ما تحب.
        </p>
      )}
      <div className="flex flex-wrap items-start gap-3">
        {images.map((src, i) => (
          <div key={src + i} className="w-20">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-black/10">
              <Image src={src} alt="" fill sizes="80px" className="object-cover" unoptimized />
              {i === 0 && multiple && (
                <span className="absolute bottom-0.5 start-0.5 rounded bg-black/60 px-1 text-[9px] font-bold text-white">
                  غلاف
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute end-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-red-600"
                aria-label="حذف الصورة"
              >
                ×
              </button>
            </div>
            {multiple && images.length > 1 && (
              <div className="mt-1 flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => moveImage(i, -1)}
                  disabled={i === 0}
                  className="flex h-5 w-6 items-center justify-center rounded border border-black/10 text-xs text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="تحريك للخلف"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  disabled={i === images.length - 1}
                  className="flex h-5 w-6 items-center justify-center rounded border border-black/10 text-xs text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="تحريك للأمام"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-black/20 text-neutral-500 transition hover:border-brand-blue hover:text-brand-blue disabled:opacity-60"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-[11px] font-semibold">{uploading ? "جاري الرفع..." : "رفع صورة"}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
