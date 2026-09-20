import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/require-user';
import { markAllNotificationsAsRead } from '@/lib/notifications';

export async function POST() {
  const { user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse;

  try {
    const result = await markAllNotificationsAsRead(user.id);
    return NextResponse.json({
      success: true,
      data: { count: result.count },
      count: result.count,
    });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Bildirimler güncellenirken bir hata oluştu.',
        },
      },
      { status: 500 }
    );
  }
}
