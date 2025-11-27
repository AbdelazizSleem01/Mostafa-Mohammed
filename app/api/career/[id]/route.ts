import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import Career from '@/models/Career'
import { authOptions } from '../../auth/[...nextauth]/route'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()
    const careerItem = await Career.findById(id)
    
    if (!careerItem) {
      return NextResponse.json({ error: 'Career item not found' }, { status: 404 })
    }

    const body = await request.json()
    
    if (!body.workplace || !body.position || !body.startDate) {
      return NextResponse.json(
        { error: 'Workplace, position, and start date are required' },
        { status: 400 }
      )
    }

    // Update the career item
    Object.assign(careerItem, body)
    await careerItem.save()
    
    return NextResponse.json(careerItem)
  } catch (error) {
    console.error('Error updating career item:', error)
    return NextResponse.json(
      { error: 'Failed to update career item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()
    const careerItem = await Career.findById(id)
    
    if (!careerItem) {
      return NextResponse.json({ error: 'Career item not found' }, { status: 404 })
    }

    await Career.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Career item deleted successfully' })
  } catch (error) {
    console.error('Error deleting career item:', error)
    return NextResponse.json(
      { error: 'Failed to delete career item' },
      { status: 500 }
    )
  }
}
