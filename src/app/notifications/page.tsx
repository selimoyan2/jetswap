import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/require-user';
import { getUserNotifications } from '@/lib/notifications';
import { NotificationsClient } from './notifications-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bildirimler | JetSwap',
  description: 'Takas teklifleriniz ve hesap hareketleriniz ile ilgili bildirimler.',
};

export default async function NotificationsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login?callbackUrl=/notifications');
  }

  const result = await getUserNotifications(user.id, { page: 1, limit: 50 });

  return (
    <NotificationsClient
      initialItems={result.items}
      initialPagination={result.pagination}
      userName={user.name || 'Kullanıcı'}
    />
  );
}
