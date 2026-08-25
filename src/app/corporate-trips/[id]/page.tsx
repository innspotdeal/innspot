import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CorporateProgramDetailView from "@/components/CorporateProgramDetailView";
import { getProgramById, listPrograms } from "@/lib/programs-repo";

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

  return <CorporateProgramDetailView program={program} programs={programs} />;
}
