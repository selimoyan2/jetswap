import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateNotificationParams,
  NotificationItem,
  NotificationQueryOptions,
  PaginatedNotifications,
} from './types';
import { renderNotificationTemplate } from './templates';

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Creates an in-app notification idempotently using server-side deterministic templates and dedupeKey.
 * Can be run standalone or within an ongoing Prisma transaction.
 */
export async function createNotification(
  params: CreateNotificationParams,
  client: DbClient = prisma
): Promise<NotificationItem | null> {
  const { userId, type, href, dedupeKey, data } = params;

  // Render safe deterministic title & message from templates
  const template = renderNotificationTemplate(type, data);
  const title = params.title || template.title;
  const message = params.message || template.message;

  // Deduplication check: if dedupeKey is provided, check existence first to avoid failing transactions
  if (dedupeKey) {
    const existing = await client.notification.findUnique({
      where: { dedupeKey },
    });
    if (existing) {
      return existing;
    }
  }

  try {
    const created = await client.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        href,
        dedupeKey: dedupeKey || null,
      },
    });
    return created;
  } catch (error: any) {
    // If dedupe collision happens concurrently, gracefully return existing if found
    if (error?.code === 'P2002' && dedupeKey) {
      const existing = await client.notification.findUnique({
        where: { dedupeKey },
      });
      if (existing) return existing;
    }
    throw error;
  }
}

/**
 * Retrieves paginated notifications for a user, sorted newest first.
 */
export async function getUserNotifications(
  userId: string,
  options?: NotificationQueryOptions,
  client: DbClient = prisma
): Promise<PaginatedNotifications> {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
  const skip = (page - 1) * limit;
  const unreadOnly = !!options?.unreadOnly;

  const where: Prisma.NotificationWhereInput = {
    userId,
    ...(unreadOnly ? { readAt: null } : {}),
  };

  const [items, total, unreadCount] = await Promise.all([
    client.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        href: true,
        dedupeKey: true,
        readAt: true,
        createdAt: true,
      },
    }),
    client.notification.count({ where }),
    client.notification.count({
      where: {
        userId,
        readAt: null,
      },
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount,
    },
  };
}

/**
 * Returns unread notifications count for a user.
 */
export async function getUnreadCount(
  userId: string,
  client: DbClient = prisma
): Promise<number> {
  return client.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}

/**
 * Marks a specific notification as read for the authenticated user.
 * Strictly verifies user ownership.
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
  client: DbClient = prisma
): Promise<{ success: boolean; notification?: NotificationItem; notFound?: boolean; unauthorized?: boolean }> {
  const notification = await client.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    return { success: false, notFound: true };
  }

  if (notification.userId !== userId) {
    return { success: false, unauthorized: true };
  }

  if (notification.readAt) {
    return { success: true, notification };
  }

  const updated = await client.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });

  return { success: true, notification: updated };
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(
  userId: string,
  client: DbClient = prisma
): Promise<{ count: number }> {
  const result = await client.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return { count: result.count };
}
