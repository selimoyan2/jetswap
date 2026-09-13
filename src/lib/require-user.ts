import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
  role?: string
}

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session?.user?.email) {
    return null
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
}

export async function requireUser() {
  const user = await getAuthUser()
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Bu işlemi gerçekleştirmek için giriş yapmalısınız.'
          }
        },
        { status: 401 }
      )
    }
  }
  return { user, errorResponse: null }
}
