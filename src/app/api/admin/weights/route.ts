import { NextResponse } from "next/server";
import { AdminRepository } from "@/repositories/admin.repository";
import { MatchingWeightsSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const validated = MatchingWeightsSchema.parse(body);

    const updated = await AdminRepository.updateMatchingWeights(validated);
    return NextResponse.json({ success: true, weights: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
