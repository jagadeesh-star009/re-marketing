import { NextResponse } from "next/server";
import { ReviewSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = ReviewSchema.parse(body);

    // Prevent duplicate reviews for the same transaction
    const existing = await prisma.review.findFirst({
      where: {
        requirementId: validated.requirementId,
        reviewerId: session.id,
        revieweeId: validated.revieweeId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this vendor for this project." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        requirementId: validated.requirementId,
        selectionId: validated.selectionId,
        reviewerId: session.id,
        revieweeId: validated.revieweeId,
        rating: validated.rating,
        comment: validated.comment,
      },
    });

    // Update vendor average rating
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { userId: validated.revieweeId },
    });

    if (vendorProfile) {
      const allReviews = await prisma.review.findMany({
        where: { revieweeId: validated.revieweeId },
        select: { rating: true },
      });

      const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
      await prisma.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: {
          rating: parseFloat(avg.toFixed(2)),
          reviewCount: allReviews.length,
        },
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
