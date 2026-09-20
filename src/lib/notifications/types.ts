import { NotificationType } from '@prisma/client';

export { NotificationType };

export interface NotificationTemplateData {
  offerId?: string;
  offeredCount?: number;
  requestedCount?: number;
  reviewId?: string;
  actorName?: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  href: string;
  dedupeKey?: string | null;
  data?: NotificationTemplateData;
  title?: string;
  message?: string;
}

export interface NotificationQueryOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  dedupeKey: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface PaginatedNotifications {
  items: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}
