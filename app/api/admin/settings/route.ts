import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import Admin from '@/models/Admin'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, currentPassword, newPassword } = await request.json()

    if (!email || !currentPassword) {
      return NextResponse.json(
        { error: 'Email and current password are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const admin = await Admin.findById(session.user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid current password' },
        { status: 400 }
      )
    }

    if (email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email })
      if (existingAdmin) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
      admin.email = email
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
      admin.password = await bcrypt.hash(newPassword, 10)
    }

    await admin.save()

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
