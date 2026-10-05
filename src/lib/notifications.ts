import { prisma } from "@/lib/prisma";

export async function createNotification(data: {
  userId: string;
  type: "OFFER_RECEIVED" | "OFFER_SHORTLISTED" | "OFFER_SELECTED" | "MESSAGE_RECEIVED" | "REQUIREMENT_EXPIRING" | "VENDOR_MATCH";
  title: string;
  message: string;
  linkUrl?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl,
      },
    });
  } catch (error) {
    console.error("Failed to persist notification:", error);
    return null;
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
