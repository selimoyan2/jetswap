'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  Send,
  MessageSquare,
  AlertCircle,
  Clock,
  Loader2,
  Lock,
  User as UserIcon,
} from 'lucide-react'
import { TradeOfferStatus } from '@prisma/client'
import { SerializedTradeMessage } from '@/lib/messages/types'

interface OfferChatProps {
  offerId: string
  offerStatus: TradeOfferStatus
}

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const timeStr = `${hours}:${minutes}`
    if (isToday) return timeStr

    const months = [
      'Oca',
      'Şub',
      'Mar',
      'Nis',
      'May',
      'Haz',
      'Tem',
      'Ağu',
      'Eyl',
      'Eki',
      'Kas',
      'Ara',
    ]
    return `${d.getDate()} ${months[d.getMonth()]} ${timeStr}`
  } catch {
    return ''
  }
}

export function OfferChat({ offerId, offerStatus }: OfferChatProps) {
  const [messages, setMessages] = useState<SerializedTradeMessage[]>([])
  const [canSendMessage, setCanSendMessage] = useState(
    offerStatus === 'PENDING' || offerStatus === 'ACCEPTED'
  )
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [inputContent, setInputContent] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const isInitialLoadRef = useRef(true)

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  }, [])

  const fetchMessages = useCallback(
    async (isPolling = false) => {
      try {
        const res = await fetch(`/api/offers/${offerId}/messages`)
        const data = await res.json()

        if (data.success && data.data) {
          const newMessages: SerializedTradeMessage[] = data.data.messages || []
          setCanSendMessage(data.data.canSendMessage)

          setMessages((prev) => {
            // Only scroll if count changed or initial load
            if (isInitialLoadRef.current || newMessages.length > prev.length) {
              setTimeout(() => {
                scrollToBottom(!isInitialLoadRef.current)
                isInitialLoadRef.current = false
              }, 50)
            }
            return newMessages
          })
        }
      } catch (err) {
        if (!isPolling) {
          console.error('Error fetching messages:', err)
        }
      } finally {
        setLoading(false)
      }
    },
    [offerId, scrollToBottom]
  )

  useEffect(() => {
    let active = true
    isInitialLoadRef.current = true

    fetch(`/api/offers/${offerId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        if (data.success && data.data) {
          setCanSendMessage(data.data.canSendMessage)
          setMessages(data.data.messages || [])
          setTimeout(() => {
            scrollToBottom(false)
            isInitialLoadRef.current = false
          }, 50)
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!active) return
        console.error('Error fetching messages:', err)
        setLoading(false)
      })

    // Polling every 10 seconds while tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(true)
      }
    }, 10000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [offerId, fetchMessages, scrollToBottom])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputContent.trim()
    if (!trimmed || sending || !canSendMessage) return

    setSending(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/offers/${offerId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: trimmed }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'Mesaj gönderilemedi.')
      } else {
        setInputContent('')
        // Append newly created message immediately
        setMessages((prev) => [...prev, data.data])
        setTimeout(() => scrollToBottom(true), 50)
      }
    } catch (err) {
      console.error('Send message error:', err)
      setErrorMessage('Mesaj iletilirken bir bağlantı hatası oluştu.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // Determine headers based on offer status
  let headerTitle = 'Takas hakkında konuşun'
  let headerDesc =
    'Ürün durumu, teslimat şekli ve takas detaylarını burada konuşabilirsiniz.'

  if (offerStatus === 'ACCEPTED') {
    headerTitle = 'Takas Detayları & Müzakere'
    headerDesc =
      'Teklif kabul edildi. Takas detaylarını JetSwap içinde netleştirebilirsiniz.'
  } else if (
    offerStatus === 'REJECTED' ||
    offerStatus === 'CANCELLED' ||
    offerStatus === 'COMPLETED'
  ) {
    headerTitle = 'Mesaj Geçmişi'
    headerDesc = 'Bu teklif kapandığı için yeni mesaj gönderilemez.'
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden flex flex-col shadow-xs">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{headerTitle}</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{headerDesc}</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="p-4 space-y-4 max-h-[380px] min-h-[220px] overflow-y-auto"
      >
        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-500" />
            <span className="text-xs">Mesajlar yükleniyor...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-300">Henüz mesaj yok.</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              Takasla ilgili bir soru sorarak konuşmayı başlatabilirsin.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.isMine
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isMine && (
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center flex-shrink-0 text-zinc-500 dark:text-zinc-400 text-xs overflow-hidden">
                    {msg.sender.avatar ? (
                      <Image
                        src={msg.sender.avatar}
                        alt={msg.sender.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[75%] sm:max-w-[70%] space-y-1 ${
                    isMine ? 'items-end text-right' : 'items-start text-left'
                  }`}
                >
                  <div
                    className={`text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-1 ${
                      isMine ? 'text-right' : 'text-left'
                    }`}
                  >
                    {isMine ? 'Sen' : msg.sender.name}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-bl-none'
                    }`}
                  >
                    {/* Render plain text safely without dangerouslySetInnerHTML */}
                    {msg.content}
                  </div>

                  <div
                    className={`flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 px-1 ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatMessageTime(msg.createdAt)}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Inline Error / Violation Alert */}
      {errorMessage && (
        <div className="mx-4 mb-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Composer or Closed Notification */}
      {canSendMessage ? (
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-2"
        >
          <div className="relative">
            <textarea
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder="Bir mesaj yazın... (Enter gönderir, Shift+Enter yeni satır)"
              maxLength={2000}
              rows={2}
              className="w-full resize-none rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <span
              className={`text-[10px] ${
                inputContent.length > 1900
                  ? 'text-amber-500 font-bold'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {inputContent.length}/2000
            </span>

            <button
              type="submit"
              disabled={!inputContent.trim() || sending}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Gönder</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 text-center flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>Bu teklif kapandığı için yeni mesaj gönderilemez.</span>
        </div>
      )}
    </div>
  )
}
