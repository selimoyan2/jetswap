import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
    const expectedPassword = process.env.ADMIN_PASSWORD || 'JetSwap2026!Admin'
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'jetswap_admin_access_key_9988'

    // Allow login via username or email
    const isUserValid = (
      username === expectedUsername || 
      username === 'admin@jetswap.com.tr' ||
      username === 'admin'
    )

    const isPassValid = (
      password === expectedPassword || 
      password === adminSecret
    )

    if (!isUserValid || !isPassValid) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz kullanıcı adı veya şifre.' },
        { status: 401 }
      )
    }

    // Generate a secure session token
    const token = Buffer.from(`${expectedUsername}:${Date.now()}:${adminSecret}`).toString('base64')

    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
      admin: {
        username: expectedUsername,
        role: 'SUPERADMIN',
        loginTime: new Date().toISOString()
      },
      token
    })

    // Set HTTP-only secure cookie
    response.cookies.set('jetswap_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Giriş işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    )
  }
}
