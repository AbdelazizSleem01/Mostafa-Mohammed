import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import Analytics from '@/models/Analytics'
import Video from '@/models/Video'
import Gallery from '@/models/Gallery'
import Certificate from '@/models/Certificate'
import Message from '@/models/Message'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    let analytics = await Analytics.findOne()
    if (!analytics) {
      analytics = await Analytics.create({ visits: 0 })
    }

    analytics.visits += 1
    analytics.lastVisit = new Date()
    await analytics.save()

    const videosCount = await Video.countDocuments()
    const galleryCount = await Gallery.countDocuments()
    const certificatesCount = await Certificate.countDocuments()
    const messagesCount = await Message.countDocuments()
    const unreadMessagesCount = await Message.countDocuments({ status: 'new' })

    return NextResponse.json({
      visits: analytics.visits,
      videos: videosCount,
      images: galleryCount,
      certificates: certificatesCount,
      messages: messagesCount,
      unreadMessages: unreadMessagesCount,
      lastVisit: analytics.lastVisit
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}