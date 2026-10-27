import type { Metadata } from "next";
import CorporateTripsListView from "@/components/CorporateTripsListView";
import { listPrograms } from "@/lib/programs-repo";

export const metadata: Metadata = {
  title: "رحلات شركات | إنسبوت",
  description:
    "رحلات شركات في الفيوم بجودة متراجعة: أماكن بنزورها بنفسنا، أكل نضيف، سفاري بسواقين عارفينهم، وجهة واحدة مسؤولة عن كل حاجة.",
};

export const revalidate = 60;

export default async function CorporateTripsPage() {
  const programs = await listPrograms();
  // الصفحة بتعرض طريقتين: البرامج الثابتة (كل برنامج عادي بحاسبة سعر، بالترتيب)
  // والبرنامج الكاستم (اللي بيفتح صفحة تصميم الرحلة). برامج التذاكر صفحاتها شغالة بس مش ظاهرة هنا
  const fixedPrograms = programs.filter((p) => !p.isCustom && !p.isBuilder && !p.isTicket);
  const customProgram = programs.find((p) => p.isBuilder) ?? null;

  // من غير أسعار: الصفحة بتركّز على الجودة، والسعر بييجي في الكلام مع العميل على واتساب
  return <CorporateTripsListView fixedPrograms={fixedPrograms} customProgram={customProgram} />;
}
