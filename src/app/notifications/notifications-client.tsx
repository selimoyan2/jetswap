'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  ArrowLeftRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserCheck,
  Clock,
  Award,
  Star,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '@/lib/notifications/types';

interface NotificationsClientProps {
  initialItems: NotificationItem[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
  userName: string;
}

export function NotificationsClient({
  initialItems,
  initialPagination,
  userName,
}: NotificationsClientProps) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [unreadCount, setUnreadCount] = useState<number>(initialPagination.unreadCount);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const displayedItems = items.filter((item) => {
    if (filter === 'unread') return item.readAt === null;
    return true;
  });

  const handleMarkAsRead = async (id: string) => {
    setLoadingAction(id);
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, readAt: new Date() } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoadingAction('all');
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((item) => ({ ...item, readAt: item.readAt || new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_OFFER:
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        );
      case NotificationType.COUNTER_OFFER:
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
        );
      case NotificationType.OFFER_ACCEPTED:
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case NotificationType.OFFER_REJECTED:
        return (
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        );
      case NotificationType.NEW_MESSAGE:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
        );
      case NotificationType.CONTACT_REVEALED:
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        );
      case NotificationType.TRADE_COMPLETION_REQUEST:
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        );
      case NotificationType.TRADE_COMPLETED:
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        );
      case NotificationType.NEW_REVIEW:
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-zinc-900 tracking-tight">
                  Bildirimler
                </h1>
                <p className="text-xs font-medium text-zinc-500">
                  {userName}, takas teklifleriniz ve hesap hareketleriniz burada listelenir.
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={loadingAction === 'all'}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Tümünü Okundu İşaretle</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Tümü ({items.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <span>Okunmamış</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  filter === 'unread' ? 'bg-white text-emerald-700' : 'bg-red-500 text-white'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification List */}
        {displayedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-800">
              {filter === 'unread'
                ? 'Okunmamış bildiriminiz bulunmuyor.'
                : 'Henüz hiç bildiriminiz yok.'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'Tüm bildirimlerinizi okudunuz. Yeni bir hareket olduğunda burada görünecek.'
                : 'Takas teklifleri aldığınızda veya mevcut takaslarınızda güncelleme olduğunda haberdar edileceksiniz.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedItems.map((item) => {
              const isUnread = item.readAt === null;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isUnread
                      ? 'bg-white border-emerald-200 shadow-xs ring-1 ring-emerald-500/10'
                      : 'bg-white/80 border-zinc-200/80 text-zinc-600'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {renderTypeIcon(item.type)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold tracking-tight ${
                            isUnread ? 'text-zinc-900' : 'text-zinc-700'
                          }`}
                        >
                          {item.title}
                        </h4>
                        {isUnread && (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        disabled={loadingAction === item.id}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        title="Okundu olarak işaretle"
                      >
                        Okundu Yap
                      </button>
                    )}
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (isUnread) {
                          handleMarkAsRead(item.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>Görüntüle</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
