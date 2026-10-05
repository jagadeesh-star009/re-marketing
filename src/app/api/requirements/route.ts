import { NextResponse } from "next/server";
import { RequirementService } from "@/services/requirement.service";
import { RequirementSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const type = searchParams.get("type") as any;
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    if (ownerId) {
      const requirements = await RequirementService.getOwnerRequirements(ownerId);
      return NextResponse.json({ requirements });
    }

    const requirements = await RequirementService.getOpenRequirements({
      type,
      categoryId,
      search,
    });
    return NextResponse.json({ requirements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const validated = RequirementSchema.parse(body);

    const requirement = await RequirementService.createRequirement(session.id, validated);
    return NextResponse.json({ success: true, requirement });
  } catch (error: any) {
    console.error("Requirement creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create requirement" },
      { status: 400 }
    );
  }
}
