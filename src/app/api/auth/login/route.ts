import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { LoginSchema } from "@/lib/validations";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const { user, token } = await AuthService.login(validated);
    await setAuthCookie(token);

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid credentials" },
      { status: 401 }
    );
  }
}
