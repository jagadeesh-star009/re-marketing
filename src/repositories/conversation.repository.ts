import { prisma } from "@/lib/prisma";

export class ConversationRepository {
  static async getOrCreateConversation(requirementId: string, ownerId: string, vendorId: string, offerId?: string) {
    let conv = await prisma.conversation.findUnique({
      where: {
        requirementId_ownerId_vendorId: {
          requirementId,
          ownerId,
          vendorId,
        },
      },
      include: {
        requirement: true,
        offer: true,
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
            attachments: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          requirementId,
          ownerId,
          vendorId,
          offerId,
        },
        include: {
          requirement: true,
          offer: true,
          messages: {
            include: {
              sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
              attachments: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    return conv;
  }

  static async findUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [{ ownerId: userId }, { vendorId: userId }],
      },
      include: {
        requirement: {
          select: { id: true, title: true, type: true, status: true },
        },
        offer: {
          select: { id: true, offeredPrice: true, status: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        requirement: {
          include: {
            category: true,
          },
        },
        offer: true,
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
            attachments: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  static async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: Array<{ fileUrl: string; fileName: string; fileType: string; fileSize: number }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          attachments: {
            create: data.attachments ?? [],
          },
        },
        include: {
          sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
          attachments: true,
        },
      });

      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: new Date() },
      });

      return msg;
    });
  }

  static async markMessagesRead(conversationId: string, currentUserId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUserId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
