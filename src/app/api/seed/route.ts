import { NextResponse } from "next/server";
import { seedMarketplaceData } from "@/lib/seed-data";

export async function POST() {
  try {
    await seedMarketplaceData();
    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed database" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await seedMarketplaceData();
    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed database" }, { status: 500 });
  }
}
