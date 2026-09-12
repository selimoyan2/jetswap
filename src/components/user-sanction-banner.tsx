'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, ShieldAlert, Clock, Send, CheckCircle2, 
  X, HelpCircle, AlertCircle, Ban, ShieldCheck 
} from 'lucide-react'
import { UserReport, UserSanction } from '@/types'
import { useLanguage } from '@/i18n'
import { 
  getStoredReports, 
  getStoredSanctions, 
  submitUserDefense 
} from '@/data/mockReports'
import { mockCurrentUser } from '@/data/mockData'

export const UserSanctionBanner: React.FC = () => {
  const { t } = useLanguage()
  const [inquiryReport, setInquiryReport] = useState<UserReport | null>(null)
  const [activeSanction, setActiveSanction] = useState<UserSanction | null>(null)
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false)
  const [defenseText, setDefenseText] = useState('')
  const [defenseSubmitted, setDefenseSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const checkStatus = () => {
    const reports = getStoredReports()
    const sanctions = getStoredSanctions()

    // Check for pending inquiries directed at currentUser
    // To allow testing, check both mockCurrentUser.id or 'usr-bad-1' (or if we simulated inquiry for currentUser)
    const pendingInquiry = reports.find(
      r => (r.reportedUserId === mockCurrentUser.id || r.reportedUserId === 'usr_me') &&
           r.status === 'INQUIRY_SENT' &&
           r.adminInquiry &&
           !r.adminInquiry.response
    )

    setInquiryReport(pendingInquiry || null)

    // Check for active sanctions
    const mySanction = sanctions.find(
      s => s.expiresAt ? new Date(s.expiresAt) > new Date() : true
    )
    // Also check if any report with currentUser has SANCTIONED status
    const sanctionedReport = reports.find(
      r => (r.reportedUserId === mockCurrentUser.id || r.reportedUserId === 'usr_me') &&
           r.status === 'SANCTIONED' &&
           r.sanction
    )

    if (mySanction) {
      setActiveSanction(mySanction)
    } else if (sanctionedReport?.sanction) {
      setActiveSanction(sanctionedReport.sanction)
    } else {
      setActiveSanction(null)
    }
  }

  useEffect(() => {
    checkStatus()

    const handleReportsUpdate = () => checkStatus()
    const handleSanctionsUpdate = () => checkStatus()

    window.addEventListener('jetswap_reports_updated', handleReportsUpdate)
    window.addEventListener('jetswap_sanctions_updated', handleSanctionsUpdate)

    return () => {
      window.removeEventListener('jetswap_reports_updated', handleReportsUpdate)
      window.removeEventListener('jetswap_sanctions_updated', handleSanctionsUpdate)
    }
  }, [])

  const handleSubmitDefense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryReport) return

    if (defenseText.trim().length < 15) {
      setErrorMsg(t.reportModal.detailsMinLengthWarning)
      return
    }

    submitUserDefense(inquiryReport.id, defenseText.trim())
    setDefenseSubmitted(true)
  }

  const handleCloseModal = () => {
    setIsDefenseModalOpen(false)
    setDefenseSubmitted(false)
    setDefenseText('')
    setErrorMsg('')
    checkStatus()
  }

  // If no inquiry and no sanction, do not render banner
  if (!inquiryReport && !activeSanction) {
    return null
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* ACTIVE SANCTION BANNER */}
        {activeSanction && (
          <div className="mb-3 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-red-500 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <Ban className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs sm:text-sm uppercase tracking-wider">
                    {t.moderation.sanctionAlertTitle}
                  </span>
                  <span className="bg-black/30 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {t.moderation.sanctionTypes[activeSanction.type] || activeSanction.type}
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-1">
                  <strong>{t.moderation.sanctionReason}</strong> {activeSanction.reason}
                </p>
                {activeSanction.expiresAt && (
                  <p className="text-[11px] text-red-200 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {t.moderation.sanctionExpiresIn}: {new Date(activeSanction.expiresAt).toLocaleString('tr-TR')}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-bold bg-white text-red-700 px-3 py-1.5 rounded-xl shadow-xs">
                Hesap Kısıtlaması Aktif
              </span>
            </div>
          </div>
        )}

        {/* PENDING ADMIN INQUIRY BANNER */}
        {inquiryReport && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-400 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs sm:text-sm uppercase tracking-wider">
                    {t.moderation.inquiryAlertTitle}
                  </span>
                  <span className="bg-black/30 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {inquiryReport.adminInquiry?.deadlineHours} Saat Süre
                  </span>
                </div>
                <p className="text-xs text-amber-100 mt-1 line-clamp-1">
                  <strong>Soru:</strong> {inquiryReport.adminInquiry?.question}
                </p>
                <p className="text-[11px] text-amber-200 mt-0.5">
                  Lütfen hesabınızın kısıtlanmaması için belirtilen süre dolmadan savunmanızı iletiniz.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDefenseModalOpen(true)}
              className="bg-zinc-950 hover:bg-black text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Savunmayı Yanıtla</span>
            </button>
          </div>
        )}
      </div>

      {/* DEFENSE SUBMISSION MODAL */}
      {isDefenseModalOpen && inquiryReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{t.moderation.inquiryAlertTitle}</h3>
                  <p className="text-[11px] text-amber-100">Resmi Yönetici Savunma İstemi</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {defenseSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-zinc-900">{t.common.success}</h4>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1 leading-relaxed">
                    {t.moderation.inquirySuccess}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="mt-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  {t.common.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitDefense} className="p-6 space-y-4">
                {/* Admin Question Box */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {t.moderation.inquiryAdminQuestion}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                      Dosya ID: {inquiryReport.id}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                    {inquiryReport.adminInquiry?.question}
                  </p>
                </div>

                {/* Complaint Context */}
                <div className="text-[11px] text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-0.5">
                  <div className="font-bold text-zinc-700">Şikayet Konusu:</div>
                  <div className="text-zinc-600">
                    Kategori: <strong>{t.reportModal.reasons[inquiryReport.category]}</strong>
                  </div>
                  {inquiryReport.itemTitle && (
                    <div className="text-zinc-600">
                      İlgili İlan: <strong>{inquiryReport.itemTitle}</strong>
                    </div>
                  )}
                </div>

                {/* Defense Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                      {t.moderation.inquiryYourResponse}
                    </label>
                    <span className={`text-[11px] font-mono ${defenseText.length < 15 ? 'text-amber-600' : 'text-emerald-600 font-bold'}`}>
                      {defenseText.length} / 600 karakter
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    maxLength={600}
                    value={defenseText}
                    onChange={e => {
                      setDefenseText(e.target.value)
                      if (errorMsg) setErrorMsg('')
                    }}
                    placeholder={t.moderation.inquiryPlaceholder}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  />
                  {errorMsg && (
                    <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.moderation.inquirySubmit}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
export default UserSanctionBanner
