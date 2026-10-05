import { NextResponse } from "next/server";
import { OfferService } from "@/services/offer.service";
import { OfferRepository } from "@/repositories/offer.repository";
import { OfferSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId") || session.id;

    const offers = await OfferRepository.findByVendor(vendorId);
    return NextResponse.json({ offers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "VENDOR") {
      return NextResponse.json({ error: "Only verified vendors can submit offers." }, { status: 403 });
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: "Vendor profile not found. Please complete your profile." }, { status: 400 });
    }

    const body = await req.json();
    const validated = OfferSchema.parse(body);

    const offer = await OfferService.submitOffer(session.id, vendorProfile.id, validated);
    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    console.error("Offer submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit offer" },
      { status: 400 }
    );
  }
}
