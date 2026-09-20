import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/require-user';
import { getUserNotifications } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireUser();
  if (errorResponse || !user) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const unreadOnlyParam = searchParams.get('unreadOnly');
    const unreadOnly = unreadOnlyParam === 'true' || unreadOnlyParam === '1';

    const result = await getUserNotifications(user.id, {
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 20 : limit,
      unreadOnly,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Bildirimler yüklenirken bir hata oluştu.',
        },
      },
      { status: 500 }
    );
  }
}

// Strictly disallow POST - clients cannot forge arbitrary notifications
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'İstemci üzerinden doğrudan bildirim oluşturulamaz.',
      },
    },
    { status: 405 }
  );
}
