import { NextResponse } from "next/server";
import { AdminRepository } from "@/repositories/admin.repository";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const kpis = await AdminRepository.getPlatformKPIs();
    const users = await AdminRepository.getAllUsers(50);
    const requirements = await AdminRepository.getAllRequirements(50);
    const weights = await AdminRepository.getMatchingWeights();
    const categories = await AdminRepository.getAllCategories();

    return NextResponse.json({
      kpis,
      users,
      requirements,
      weights,
      categories,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
