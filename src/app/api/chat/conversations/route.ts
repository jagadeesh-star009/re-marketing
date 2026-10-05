import { NextResponse } from "next/server";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await ConversationRepository.findUserConversations(session.id);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requirementId, ownerId, vendorId, offerId } = await req.json();
    if (!requirementId || !ownerId || !vendorId) {
      return NextResponse.json({ error: "Missing required conversation parties" }, { status: 400 });
    }

    const conversation = await ConversationRepository.getOrCreateConversation(
      requirementId,
      ownerId,
      vendorId,
      offerId
    );

    return NextResponse.json({ conversation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
