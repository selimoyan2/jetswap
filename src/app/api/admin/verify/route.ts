import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('jetswap_admin_token')?.value
    const authHeader = request.headers.get('x-admin-key')
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'jetswap_admin_access_key_9988'
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin'

    if (authHeader && authHeader === adminSecret) {
      return NextResponse.json({
        authenticated: true,
        user: { username: expectedUsername, role: 'SUPERADMIN' }
      })
    }

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [user, , secret] = decoded.split(':')

    if (user === expectedUsername && secret === adminSecret) {
      return NextResponse.json({
        authenticated: true,
        user: { username: expectedUsername, role: 'SUPERADMIN' }
      })
    }

    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
