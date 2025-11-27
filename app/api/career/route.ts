import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import Career from '@/models/Career'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  try {
    await dbConnect()
    const career = await Career.find().sort({ startDate: -1 })
    return NextResponse.json(career)
  } catch (error) {
    console.error('Error fetching career:', error)
    return NextResponse.json(
      { error: 'Failed to fetch career' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const body = await request.json()
    
    if (!body.workplace || !body.position || !body.startDate) {
      return NextResponse.json(
        { error: 'Workplace, position, and start date are required' },
        { status: 400 }
      )
    }

    const careerItem = await Career.create(body)
    return NextResponse.json(careerItem, { status: 201 })
  } catch (error) {
    console.error('Error creating career item:', error)
    return NextResponse.json(
      { error: 'Failed to create career item' },
      { status: 500 }
    )
  }
}