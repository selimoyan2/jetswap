import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/require-user';
import { markNotificationAsRead } from '@/lib/notifications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse;

  try {
    const { id } = await params;

    const result = await markNotificationAsRead(user.id, id);

    if (result.notFound) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Bildirim bulunamadı.',
          },
        },
        { status: 404 }
      );
    }

    if (result.unauthorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Bu bildirimi okundu olarak işaretleme yetkiniz yok.',
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.notification,
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Bildirim güncellenirken bir hata oluştu.',
        },
      },
      { status: 500 }
    );
  }
}
