import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Geçersiz istek gövdesi.'
          }
        },
        { status: 400 }
      )
    }

    const { name, email, password, phone, country, city, district } = body || {}

    // 1. Missing required fields validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_NAME',
            message: 'Ad Soyad alanı zorunludur.'
          }
        },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_EMAIL',
            message: 'E-posta adresi zorunludur.'
          }
        },
        { status: 400 }
      )
    }

    // 2. Email normalization & format check
    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Geçerli bir e-posta adresi giriniz.'
          }
        },
        { status: 400 }
      )
    }

    // 3. Password length check
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Şifreniz en az 8 karakter uzunluğunda olmalıdır.'
          }
        },
        { status: 400 }
      )
    }

    // 4. Duplicate email check
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Bu e-posta adresi zaten kullanımda.'
          }
        },
        { status: 409 }
      )
    }

    // 5. Password hashing (bcryptjs, 10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6. Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
        phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
        country: typeof country === 'string' && country.trim() ? country.trim() : 'TR',
        city: typeof city === 'string' && city.trim() ? city.trim() : 'İstanbul',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        city: true,
        createdAt: true
      }
    })

    // 7. Safe output (Never return password)
    return NextResponse.json(
      {
        success: true,
        data: newUser
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Kayıt işlemi sırasında bir sunucu hatası oluştu.'
        }
      },
      { status: 500 }
    )
  }
}
