'use client'

import React, { useState } from 'react'
import { 
  X, ArrowLeftRight, ShieldCheck, Mail, Lock, User as UserIcon, 
  CheckCircle2, Phone, MapPin, AlertCircle, Sparkles, Building
} from 'lucide-react'
import { User } from '@/types'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void
  initialMode?: 'login' | 'register'
  customPromptMessage?: string
}

const TURKEY_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 
  'Gaziantep', 'Kocaeli', 'Mersin', 'Eskişehir', 'Kayseri', 'Samsun', 'Trabzon', 'Diğer'
]

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialMode = 'register',
  customPromptMessage
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  
  // Registration Form State (Zorunlu Güvenlik Alanları)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('İstanbul')
  const [district, setDistrict] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isLogin) {
      // Login validation
      if (!email || !password) {
        setError('Lütfen e-posta ve şifrenizi girin.')
        return
      }

      // Check existing local users or create session
      const stored = localStorage.getItem('jetswap_users_db')
      let userList: User[] = stored ? JSON.parse(stored) : []
      
      const found = userList.find(u => u.email?.toLowerCase() === email.trim().toLowerCase())
      
      let loggedUser: User
      if (found) {
        loggedUser = found
      } else {
        // Fallback for new login
        loggedUser = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim(),
          phone: '+90 5XX XXX XX XX',
          country: 'TR',
          city: 'İstanbul',
          district: 'Merkez',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          jetTrust: 65,
          verifiedSwapper: false,
          completedSwaps: 0,
          rating: 5.0,
          reviewCount: 0
        }
      }

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess(loggedUser)
        onClose()
        setIsSuccess(false)
      }, 1000)
    } else {
      // Register validation (Zorunlu Güvenlik Kuralları)
      if (!name.trim()) {
        setError('Ad ve Soyad alanı gerçek kişi doğrulaması için zorunludur.')
        return
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Geçerli bir e-posta adresi giriniz.')
        return
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setError('Lütfen en az 10 haneli geçerli bir cep telefonu numarası giriniz (Güvenli SMS ve takas teslimatı için zorunludur).')
        return
      }
      if (!district.trim()) {
        setError('İlçe / Semt alanı elden takas eşleşmeleri için zorunludur.')
        return
      }
      if (password.length < 6) {
        setError('Şifreniz en az 6 karakter olmalıdır.')
        return
      }
      if (!termsAccepted) {
        setError('JetSwap "Para Yok. Takas Var." ilkelerini ve kullanıcı sözleşmesini onaylamanız zorunludur.')
        return
      }

      // Create high-trust new user
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        country: 'TR',
        city,
        district: district.trim(),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        jetTrust: 70, // Kayıt olan kullanıcı temel güven puanı
        verifiedSwapper: false,
        completedSwaps: 0,
        rating: 5.0,
        reviewCount: 0
      }

      // Persist in local user db
      try {
        const stored = localStorage.getItem('jetswap_users_db')
        const userList: User[] = stored ? JSON.parse(stored) : []
        userList.push(newUser)
        localStorage.setItem('jetswap_users_db', JSON.stringify(userList))
      } catch {}

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess(newUser)
        onClose()
        setIsSuccess(false)
      }, 1200)
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
            {isLogin ? 'JetSwap Hesabına Giriş Yap' : 'JetSwap Takas Topluluğuna Katıl'}
          </h3>
          <p className="text-xs text-emerald-200 mt-1">
            {customPromptMessage || 'Para yok. Eşyanı ekle, istediğini söyle, doğrudan takas et.'}
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
              Ücretsiz Kayıt Ol
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                isLogin ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-zinc-900">
              {isLogin ? 'Giriş Başarılı!' : 'Hoş Geldiniz!'}
            </h4>
            <p className="text-xs text-zinc-600">
              Profiliniz başarıyla yüklendi. Takas dünyasına yönlendiriliyorsunuz...
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
                    Ad & Soyad <span className="text-red-500">*</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-1">(Takas güvenliği için zorunludur)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Phone Number (Zorunlu) */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Cep Telefonu <span className="text-red-500">*</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-1">(Takas teslimatı ve SMS onayı için zorunlu)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Location: City & District (Zorunlu) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      Şehir <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        {TURKEY_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      İlçe / Semt <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        placeholder="Örn: Kadıköy, Çankaya"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email (Zorunlu) */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                E-posta Adresi <span className="text-red-500">*</span>
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
                Şifre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
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
                    <strong className="text-emerald-900">JetSwap Takas Taahhüdü:</strong> Platformda <strong>nakit para talep etmeyeceğimi</strong>, yalnızca doğrudan eşya/hizmet takası yapacağımı ve <a href="#kurallar" className="underline font-bold text-emerald-800">Kullanıcı Güvenlik Sözleşmesini</a> kabul ediyorum.
                  </span>
                </label>
              </div>
            )}

            {/* JetTrust Information */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                JetSwap güvenli bir topluluktur. Bilgileriniz şifrelenir ve yalnızca başarılı takas anlaşmalarında karşı tarafa güvenli olarak aktarılır.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLogin ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Güvenli Giriş Yap</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kayıt Ol & Takasa Başla</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
