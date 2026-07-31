import Link from "next/link";
import type { ReactNode } from "react";

export default function ScrollRow({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-brand-orange">{title}</h2>
        <Link
          href={href}
          aria-label={title}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current rtl:-scale-x-100">
            <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
