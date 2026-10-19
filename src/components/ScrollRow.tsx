import Link from "next/link";
import type { ReactNode } from "react";
import ArrowIcon from "@/components/ArrowIcon";

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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:shadow-md"
        >
          <ArrowIcon direction="next" className="h-4 w-auto" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
