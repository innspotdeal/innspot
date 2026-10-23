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
  // الصفحة بتعرض طريقتين: البرامج الثابتة (كل برنامج عادي بحاسبة سعر، بالترتيب)
  // والبرنامج الكاستم (اللي بيفتح صفحة تصميم الرحلة). برامج التذاكر صفحاتها شغالة بس مش ظاهرة هنا
  const fixedPrograms = programs.filter((p) => !p.isCustom && !p.isBuilder && !p.isTicket);
  const customProgram = programs.find((p) => p.isBuilder) ?? null;
  const startingPrices = await getStartingPrices(fixedPrograms.map((p) => p.id));

  return (
    <CorporateTripsListView
      fixedPrograms={fixedPrograms}
      customProgram={customProgram}
      startingPrices={startingPrices}
    />
  );
}
