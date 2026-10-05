import { NextResponse } from "next/server";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { MessageSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    const conversation = await ConversationRepository.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Mark messages from the other user as read
    await ConversationRepository.markMessagesRead(conversationId, session.id);

    return NextResponse.json({ conversation });
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

    const body = await req.json();
    const validated = MessageSchema.parse(body);

    const message = await ConversationRepository.sendMessage({
      conversationId: validated.conversationId,
      senderId: session.id,
      content: validated.content,
      attachments: validated.attachments,
    });

    // Notify the recipient
    const conv = await prisma.conversation.findUnique({
      where: { id: validated.conversationId },
    });

    if (conv) {
      const recipientId = conv.ownerId === session.id ? conv.vendorId : conv.ownerId;
      await createNotification({
        userId: recipientId,
        type: "MESSAGE_RECEIVED",
        title: `New message from ${session.name}`,
        message: validated.content.length > 60 ? validated.content.substring(0, 57) + "..." : validated.content,
        linkUrl: `/messages?conversationId=${conv.id}`,
      });
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 400 });
  }
}
