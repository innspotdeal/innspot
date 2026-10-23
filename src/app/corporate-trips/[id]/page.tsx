import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CorporateProgramDetailView from "@/components/CorporateProgramDetailView";
import CustomTripBuilder from "@/components/CustomTripBuilder";
import { getProgramById, listPrograms } from "@/lib/programs-repo";
import { listActiveOptions } from "@/lib/custom-trip-repo";
import { listHotels } from "@/lib/hotels-repo";
import { listProgramAddonModes, listPublicProgramAddons } from "@/lib/program-addons";
import { listProgramSafariModes } from "@/lib/pricing";
import { getSafariInfo } from "@/lib/safari-info";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = await getProgramById(id);

  if (!program) {
    return { title: "غير موجود | إنسبوت" };
  }

  return {
    title: `${program.name} | إنسبوت`,
    description: program.description,
  };
}

export default async function CorporateProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [program, programs] = await Promise.all([getProgramById(id), listPrograms()]);

  if (!program) {
    notFound();
  }

  // البرنامج المخصّص صفحته مكوّن رحلة تفاعلي بدل مخطط الرحلة العادي
  if (program.isBuilder) {
    const [allOptions, modes, hotels] = await Promise.all([
      listActiveOptions(),
      listProgramAddonModes(),
      listHotels(),
    ]);
    // الإضافات اللي البرنامج ده قافلها بتتشال، والمشمولة بتتحسب دايمًا.
    // المبيت بييجي من صفحة الفنادق نفسها، فأماكن المبيت القديمة في خيارات الكاستم مش بتتبعت
    const builderModes = modes[program.id] ?? {};
    const options = allOptions.filter(
      (o) => o.kind !== "hotel" && (o.kind !== "addon" || builderModes[o.id] !== "hidden")
    );
    const includedAddonIds = options
      .filter((o) => o.kind === "addon" && builderModes[o.id] === "included")
      .map((o) => o.id);
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-brand-blue sm:text-4xl">{program.name}</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-600">{program.description}</p>
        <div className="mt-8">
          <CustomTripBuilder options={options} hotels={hotels} includedAddonIds={includedAddonIds} />
        </div>
      </div>
    );
  }

  const [programAddons, safariModes, safariInfo] = await Promise.all([
    listPublicProgramAddons(programs.map((p) => p.id)),
    listProgramSafariModes(),
    getSafariInfo(),
  ]);

  return (
    <CorporateProgramDetailView
      program={program}
      programs={programs}
      programAddons={programAddons}
      safariModes={safariModes}
      safariInfo={safariInfo}
    />
  );
}
