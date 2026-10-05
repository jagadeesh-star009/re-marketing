import { NextResponse } from "next/server";
import { RequirementService } from "@/services/requirement.service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const requirement = await RequirementService.getRequirementById(id);
    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }
    return NextResponse.json({ requirement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
