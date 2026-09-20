import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/require-user';
import { getUnreadCount } from '@/lib/notifications';

export async function GET() {
  const { user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse;

  try {
    const unreadCount = await getUnreadCount(user.id);
    return NextResponse.json({
      success: true,
      data: { unreadCount },
      unreadCount,
    });
  } catch (error) {
    console.error('Failed to get unread notifications count:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Okunmamış bildirim sayısı alınamadı.',
        },
      },
      { status: 500 }
    );
  }
}
