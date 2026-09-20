import { NextResponse, type NextRequest } from 'next/server'
import { 
  DEFAULT_LOCALE, 
  SUPPORTED_LOCALE_CODES, 
  LOCALE_COOKIE_NAME, 
  SupportedLanguage, 
  isValidLocale 
} from './i18n/config'

export function middleware(request: NextRequest) {

  const { pathname, searchParams } = request.nextUrl

  // Skip static files, API routes, internal next paths, and public assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file extension like favicon.ico, images, robots.txt
  ) {
    return NextResponse.next()
  }

  // 1. Check if locale prefix is present in URL, e.g. /tr/... or /en/...
  const segments = pathname.split('/')
  const firstSegment = segments[1] as SupportedLanguage | undefined
  const hasLocalePrefix = firstSegment && SUPPORTED_LOCALE_CODES.includes(firstSegment)

  let locale: SupportedLanguage = DEFAULT_LOCALE

  if (hasLocalePrefix) {
    locale = firstSegment
  } else {
    // 2. Check query param: ?lang=en or ?lang=tr
    const langParam = searchParams.get('lang')
    if (isValidLocale(langParam)) {
      locale = langParam
    } else {
      // 3. Check cookie
      const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value
      if (isValidLocale(cookieLocale)) {
        locale = cookieLocale
      } else {
        // 4. Fallback to Accept-Language header
        const acceptLang = request.headers.get('accept-language') || ''
        if (acceptLang.toLowerCase().includes('tr')) {
          locale = 'tr'
        } else if (acceptLang.toLowerCase().includes('en')) {
          locale = 'en'
        }
      }
    }
  }

  // If URL has locale prefix (e.g., /en/offers/123), rewrite to the internal canonical route (/offers/123)
  if (hasLocalePrefix) {
    const cleanPath = '/' + segments.slice(2).join('/')
    const targetUrl = new URL(cleanPath === '/' ? '/' : cleanPath, request.url)
    targetUrl.search = request.nextUrl.search

    const response = NextResponse.rewrite(targetUrl)
    response.headers.set('x-jetswap-locale', locale)
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
    return response
  }

  // For non-prefixed routes, pass forward with x-jetswap-locale header and set cookie if query param was used
  const response = NextResponse.next()
  response.headers.set('x-jetswap-locale', locale)

  if (searchParams.get('lang') && isValidLocale(searchParams.get('lang'))) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}
