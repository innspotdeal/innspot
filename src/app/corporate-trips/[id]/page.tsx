import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CorporateProgramDetailView from "@/components/CorporateProgramDetailView";
import { corporatePrograms } from "@/data/programs";

function findProgram(id: string) {
  return corporatePrograms.find((program) => program.id === id);
}

export function generateStaticParams() {
  return corporatePrograms.map((program) => ({ id: program.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = findProgram(id);

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
  const program = findProgram(id);

  if (!program) {
    notFound();
  }

  return <CorporateProgramDetailView program={program} />;
}
