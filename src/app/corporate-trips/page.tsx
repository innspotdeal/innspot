import type { Metadata } from "next";
import CorporateTripsListView from "@/components/CorporateTripsListView";
import { listPrograms } from "@/lib/programs-repo";
import { getStartingPrices } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "رحلات شركات | إنسبوت",
  description: "برامج رحلات جماعية مصممة خصيصًا للشركات في الفيوم",
};

export const revalidate = 60;

export default async function CorporateTripsPage() {
  const programs = await listPrograms();
  // الصفحة بتعرض طريقتين بس: البرنامج الثابت (أول برنامج عادي بحاسبة سعر في الترتيب — برنامج الباص)
  // والبرنامج الكاستم (اللي بيفتح صفحة تصميم الرحلة). باقي البرامج صفحاتها شغالة بس مش ظاهرة هنا
  const fixedProgram = programs.find((p) => !p.isCustom && !p.isBuilder && !p.isTicket) ?? null;
  const customProgram = programs.find((p) => p.isBuilder) ?? null;
  const startingPrices = fixedProgram ? await getStartingPrices([fixedProgram.id]) : {};

  return (
    <CorporateTripsListView
      fixedProgram={fixedProgram}
      customProgram={customProgram}
      fixedStartingPrice={fixedProgram ? startingPrices[fixedProgram.id] : undefined}
    />
  );
}
