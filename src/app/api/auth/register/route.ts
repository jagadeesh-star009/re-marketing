import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { RegisterSchema } from "@/lib/validations";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const { user, token } = await AuthService.register(validated);
    await setAuthCookie(token);

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register account" },
      { status: 400 }
    );
  }
}
