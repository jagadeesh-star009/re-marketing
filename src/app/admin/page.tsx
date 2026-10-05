import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminRepository } from "@/repositories/admin.repository";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [kpis, users, requirements, weights, categories] = await Promise.all([
    AdminRepository.getPlatformKPIs(),
    AdminRepository.getAllUsers(50),
    AdminRepository.getAllRequirements(50),
    AdminRepository.getMatchingWeights(),
    AdminRepository.getAllCategories(),
  ]);

  return (
    <AdminClient
      initialData={{
        kpis,
        users,
        requirements,
        weights,
        categories,
      }}
    />
  );
}
