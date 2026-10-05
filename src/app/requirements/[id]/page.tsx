import { notFound } from "next/navigation";
import { RequirementRepository } from "@/repositories/requirement.repository";
import { getSession } from "@/lib/auth";
import { RequirementDetailClient } from "./RequirementDetailClient";

export const dynamic = "force-dynamic";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requirement = await RequirementRepository.findById(id);

  if (!requirement) {
    notFound();
  }

  const currentUser = await getSession();

  return <RequirementDetailClient requirement={requirement} currentUser={currentUser} />;
}
