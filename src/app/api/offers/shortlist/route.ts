import { NextResponse } from "next/server";
import { OfferService } from "@/services/offer.service";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requirementId, offerId, vendorId } = await req.json();
    if (!requirementId || !offerId || !vendorId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const result = await OfferService.toggleShortlist(requirementId, offerId, vendorId, session.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
