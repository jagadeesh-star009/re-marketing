import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      phone: true,
      vendorProfile: true,
      userProfile: true,
      _count: {
        select: {
          notifications: { where: { isRead: false } },
        },
      },
    },
  });

  return NextResponse.json({ user });
}
