'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight } from 'lucide-react'
import { CreateOfferModal, TargetItemSummary } from '@/components/offers/create-offer-modal'

interface ItemDetailOfferButtonProps {
  item: TargetItemSummary
  isLoggedIn: boolean
}

export const ItemDetailOfferButton: React.FC<ItemDetailOfferButtonProps> = ({
  item,
  isLoggedIn,
}) => {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/items/${item.id}`)
      return
    }
    setModalOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ArrowLeftRight className="w-4 h-4" />
        <span>Takas Teklifi Gönder</span>
      </button>

      {isLoggedIn && (
        <CreateOfferModal
          isOpen={modalOpen}
          targetItem={item}
          onClose={() => setModalOpen(false)}
          onSuccess={(offerId) => {
            router.push(`/offers/${offerId}`)
          }}
        />
      )}
    </>
  )
}
