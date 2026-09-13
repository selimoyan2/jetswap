/**
 * JetSwap Contact Privacy Barrier Filter (PRD Madde 17 & Sprint 7)
 * contactRevealed === false durumunda kişisel iletişim bilgilerinin
 * (telefon, e-posta, WhatsApp, Telegram, sosyal medya hesapları)
 * mesajlarda paylaşılmasını engeller.
 */

export type ContactViolationReason =
  | 'PHONE'
  | 'EMAIL'
  | 'WHATSAPP'
  | 'TELEGRAM'
  | 'SOCIAL_CONTACT'

export interface ContactFilterResult {
  blocked: boolean
  reason: ContactViolationReason | null
  warningMessage: string | null
}

const PRIVACY_WARNING =
  'İletişim bilgilerini bu aşamada paylaşamazsın. Güvenli takas süreci tamamlandığında iletişim bilgileri kontrollü şekilde açılacaktır.'

/**
 * Normalizes text to handle Turkish characters while preserving original for checks
 */
function normalizeForAnalysis(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
}

export function detectContactInfo(
  text: string,
  options?: { allowContact?: boolean }
): ContactFilterResult {
  if (!text || options?.allowContact) {
    return { blocked: false, reason: null, warningMessage: null }
  }

  const raw = text.trim()
  const lower = normalizeForAnalysis(raw)

  // 1. WhatsApp Detection
  // Keywords: whatsapp, watsapp, wa.me, api.whatsapp.com, wp'den yaz, wp den, etc.
  const whatsappRegex =
    /(whatsapp|watsapp|whatsap|watsap|wotzap|wa\.me|api\.whatsapp\.com|wp(\s*['’`´]?\s*den|\s+den|\s*dan|\s+dan)?\s*(yaz|ulas|ara|ekle|gec)|wp\s*:\s*\+?\d+)/i
  if (whatsappRegex.test(lower)) {
    return {
      blocked: true,
      reason: 'WHATSAPP',
      warningMessage: PRIVACY_WARNING,
    }
  }

  // 2. Telegram Detection
  // Keywords: telegram, t.me/, t.me
  const telegramRegex = /(telegram|t\.me\/|t\.me\b)/i
  if (telegramRegex.test(lower)) {
    return {
      blocked: true,
      reason: 'TELEGRAM',
      warningMessage: PRIVACY_WARNING,
    }
  }

  // 3. Email Detection
  // Standard email (e.g. name@example.com)
  const standardEmailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
  if (standardEmailRegex.test(raw)) {
    return {
      blocked: true,
      reason: 'EMAIL',
      warningMessage: PRIVACY_WARNING,
    }
  }

  // Obfuscated email detection: e.g. "selim @ gmail.com", "selim(at)gmail.com", "selim[at]gmail.com"
  const obfuscatedEmailRegex =
    /[A-Za-z0-9._%+-]+\s*(@|\(at\)|\[at\]|\bat\b)\s*[A-Za-z0-9.-]+\s*(\.|\(nokta\)|\[nokta\]|\bdot\b)\s*(com|net|org|edu|gov|com\.tr|me|co|io|dev|de|uk)/i
  if (obfuscatedEmailRegex.test(lower)) {
    return {
      blocked: true,
      reason: 'EMAIL',
      warningMessage: PRIVACY_WARNING,
    }
  }

  // Common email domains with spacing trick (e.g. "test @ gmail . com" or "selim@gmail")
  const emailDomainRegex =
    /\b(gmail|hotmail|outlook|yahoo|icloud|yandex|mail)\s*(\.|\(nokta\)|\[nokta\])\s*(com|net|org|com\.tr)\b/i
  if (emailDomainRegex.test(lower)) {
    return {
      blocked: true,
      reason: 'EMAIL',
      warningMessage: PRIVACY_WARNING,
    }
  }

  // 4. Social Media Direct Contact / Redirection
  // e.g. "instagramdan yaz", "insta: @...", "insta @example", "facebooktan yaz", etc.
  const socialContactRegex =
    /(insta(gram)?(\s*['’`´]?\s*dan|\s+dan|\s*den|\s+den)?\s*(yaz|ulas|ekle|hesabim)|insta\s*:\s*@?\w+|@[\w.]{3,}\s*(dan|den)?\s*(yaz|ulas)|facebook(\s*['’`´]?\s*tan|\s+tan)?\s*(yaz|ulas)|(bana|hesabima)?\s*ozelden\s*yaz)/i
  if (socialContactRegex.test(lower)) {
    return {
      blocked: true,
      reason: 'SOCIAL_CONTACT',
      warningMessage: PRIVACY_WARNING,
    }
  }

  // 5. Phone Number Detection
  // We must detect real phone patterns (Turkish mobile: 05xx..., +90 5xx..., 5xx xxx xx xx, 10-11 contiguous or grouped digits)
  // WITHOUT false positives for:
  // - Years: "2024 model", "2023", "1999"
  // - Storage / Specs: "128 GB", "256gb", "16 GB RAM", "4K", "1080p", "144 Hz"
  // - Time: "Saat 15:30", "15.30", "09:00"
  // - Short numbers: "1234", "1-2-3", "son 4 hanesi"

  // Pattern A: Turkish mobile phone with standard formatting or country code
  // e.g. +90 532 123 45 67, 0090 532..., 0532 123 45 67, 05321234567, 532 123 45 67, 5321234567
  const turkishMobileRegex =
    /(?:(?:\+|00)90[\s.-]?)?0?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/
  if (turkishMobileRegex.test(raw)) {
    return {
      blocked: true,
      reason: 'PHONE',
      warningMessage: PRIVACY_WARNING,
    }
  }

  // Pattern B: Sequence of 10 or more digits, possibly separated by spaces, dots, dashes
  const digitMatches = raw.match(/\b(?:\+?90|0)?[\d\s.-]{9,}\b/g)
  if (digitMatches) {
    for (const match of digitMatches) {
      // Clean digits only
      const digitsOnly = match.replace(/\D/g, '')

      // Check if it looks like a phone number (10 to 14 digits)
      if (digitsOnly.length >= 10 && digitsOnly.length <= 14) {
        // Confirm it doesn't match a time format or innocent unit
        const matchIndex = raw.indexOf(match)
        const contextAfter = raw.slice(matchIndex + match.length, matchIndex + match.length + 15).toLowerCase()
        const contextBefore = raw.slice(Math.max(0, matchIndex - 15), matchIndex).toLowerCase()

        const isUnit = /\b(gb|mb|tb|ram|mah|hz|khz|ghz|dpi|rpm|watt|volt|amper)\b/.test(contextAfter)
        const isTime = /\b(saat|dakika|dk)\b/.test(contextBefore) || /:\d{2}/.test(match)

        if (!isUnit && !isTime) {
          return {
            blocked: true,
            reason: 'PHONE',
            warningMessage: PRIVACY_WARNING,
          }
        }
      }
    }
  }

  // Pattern C: Explicit phone keywords followed by digits: "tel:", "telefon:", "numaram:", "ara:"
  const phoneKeywordRegex =
    /(?:tel(?:efon)?|numara(?:m|si)?|gsm|cep|bana\s+ulas)\s*[:=]?\s*0?[\d\s.-]{7,}/i
  if (phoneKeywordRegex.test(lower)) {
    const cleaned = lower.match(phoneKeywordRegex)?.[0]?.replace(/\D/g, '') || ''
    if (cleaned.length >= 7) {
      return {
        blocked: true,
        reason: 'PHONE',
        warningMessage: PRIVACY_WARNING,
      }
    }
  }

  return { blocked: false, reason: null, warningMessage: null }
}
