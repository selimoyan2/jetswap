'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, ArrowLeftRight, ShieldCheck, Mail, Lock, User as UserIcon, 
  CheckCircle2, Phone, MapPin, AlertCircle, Sparkles, Building, Globe, Loader2
} from 'lucide-react'
import { User } from '@/types'
import { useLanguage } from '@/i18n'
import { signIn, getSession } from 'next-auth/react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User, isNewRegistration?: boolean) => void
  initialMode?: 'login' | 'register'
  customPromptMessage?: string
}

import { COUNTRIES, TURKEY_CITIES } from '@/data/locations'
export { COUNTRIES, TURKEY_CITIES }

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialMode = 'register',
  customPromptMessage
}) => {
  const { t } = useLanguage()
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  
  // Sync tab mode whenever modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login')
      setError('')
    }
  }, [isOpen, initialMode])

  // Registration Form State (Zorunlu Güvenlik Alanları)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('TR')
  const [city, setCity] = useState('İstanbul')
  const [district, setDistrict] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isLogin) {
      // Login validation
      if (!email || !password) {
        setError(t.auth.errors.fillEmailPass)
        return
      }

      setLoading(true)

      try {
        const res = await signIn('credentials', {
          redirect: false,
          email: email.trim().toLowerCase(),
          password,
        })

        if (!res || res.error) {
          setError(t.auth.errors.fillEmailPass ? 'E-posta veya şifre hatalı.' : 'E-posta veya şifre hatalı.')
          setLoading(false)
          return
        }

        const session = await getSession()
        const sessionUser = session?.user

        const loggedUser: User = {
          id: sessionUser?.id || `usr-${Date.now()}`,
          name: sessionUser?.name || email.split('@')[0],
          email: sessionUser?.email || email.trim().toLowerCase(),
          phone: '+90 5XX XXX XX XX',
          country: 'TR',
          city: 'İstanbul',
          district: 'Merkez',
          avatar: sessionUser?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          jetTrust: 70,
          verifiedSwapper: false,
          completedSwaps: 0,
          rating: 5.0,
          reviewCount: 0
        }

        setIsSuccess(true)
        setTimeout(() => {
          onSuccess(loggedUser, false)
          onClose()
          setIsSuccess(false)
          setLoading(false)
        }, 800)
      } catch {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
        setLoading(false)
      }
    } else {
      // Register validation
      if (!name.trim()) {
        setError(t.auth.errors.nameRequired)
        return
      }
      if (!email.trim() || !email.includes('@')) {
        setError(t.auth.errors.validEmail)
        return
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setError(t.auth.errors.validPhone)
        return
      }
      if (!city.trim()) {
        setError(t.auth.errors.cityRequired)
        return
      }
      if (!district.trim()) {
        setError(t.auth.errors.districtRequired)
        return
      }
      if (password.length < 8) {
        setError(t.auth.errors.passwordMin || 'Şifre en az 8 karakter olmalıdır.')
        return
      }
      if (!termsAccepted) {
        setError(t.auth.errors.termsRequired)
        return
      }

      setLoading(true)

      try {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            country,
            city: city.trim(),
            district: district.trim() || undefined,
          }),
        })

        const regData = await regRes.json()

        if (!regRes.ok || !regData.success) {
          setError(regData?.error?.message || 'Kayıt işlemi sırasında bir hata oluştu.')
          setLoading(false)
          return
        }

        // Automatically sign in the registered user
        const signInRes = await signIn('credentials', {
          redirect: false,
          email: email.trim().toLowerCase(),
          password,
        })

        const session = await getSession()
        const sessionUser = session?.user

        const newUser: User = {
          id: regData.data?.id || sessionUser?.id || `usr-${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          country,
          city: city.trim(),
          district: district.trim(),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          jetTrust: 70,
          verifiedSwapper: false,
          completedSwaps: 0,
          rating: 5.0,
          reviewCount: 0
        }

        setIsSuccess(true)
        setTimeout(() => {
          onSuccess(newUser, true)
          onClose()
          setIsSuccess(false)
          setLoading(false)
        }, 1000)
      } catch {
        setError('Kayıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ArrowLeftRight className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-black">
            {isLogin ? t.auth.loginTitle : t.auth.registerTitle}
          </h3>
          <p className="text-xs text-emerald-200 mt-1">
            {customPromptMessage || t.auth.tagline}
          </p>

          {/* Mode Tabs */}
          <div className="flex bg-emerald-950/50 p-1 rounded-2xl mt-4 max-w-xs mx-auto border border-emerald-700/50">
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                !isLogin ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              {t.auth.tabRegister}
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                isLogin ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              {t.auth.tabLogin}
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-zinc-900">
              {isLogin ? t.auth.successLogin : t.auth.successRegister}
            </h4>
            <p className="text-xs text-zinc-600">
              {t.auth.redirecting}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <>
                {/* Full Name (Zorunlu) */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    {t.auth.fullName} <span className="text-red-500">*</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-1">{t.auth.fullNameHint}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t.auth.fullNamePlaceholder}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Phone Number (Zorunlu) */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    {t.auth.phone} <span className="text-red-500">*</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-1">{t.auth.phoneHint}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={t.auth.phonePlaceholder}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Country Selection (Ülke) */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    {t.auth.country} <span className="text-red-500">*</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-1">{t.auth.countryHint}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={e => {
                        const val = e.target.value
                        setCountry(val)
                        if (val === 'TR') {
                          setCity('İstanbul')
                        } else {
                          setCity('')
                        }
                      }}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Location: City & District (Zorunlu) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      {t.auth.city} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {country === 'TR' ? (
                        <select
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                        >
                          {TURKEY_CITIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder={t.auth.cityPlaceholder}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      )}
                      <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      {t.auth.district} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        placeholder={t.auth.districtPlaceholder}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email (Zorunlu) */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {t.auth.email} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="adiniz@example.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password (Zorunlu) */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {t.auth.password} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.auth.passwordHint}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Terms and Zero-Cash Commitment Checkbox (Kayıt İçin Zorunlu) */}
            {!isLogin && (
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-[11px] text-zinc-700 leading-snug">
                    <strong className="text-emerald-900">{t.auth.commitmentTitle} </strong>
                    {t.auth.termsPledge} <a href="#kurallar" className="underline font-bold text-emerald-800">{t.auth.termsLink}</a> {t.auth.termsNotice}
                  </span>
                </label>
              </div>
            )}

            {/* JetTrust Information */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {t.auth.trustNote}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Lütfen bekleyin...</span>
                </>
              ) : isLogin ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t.auth.submitLogin}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.auth.submitRegister}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
