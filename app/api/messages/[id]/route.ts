import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import Message from '@/models/Message'
import { authOptions } from '../../auth/[...nextauth]/route'
import { sendReplyEmail } from '@/lib/email'

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const body = await request.json()
    const { id } = params

    const message = await Message.findById(id)
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (body.action === 'markAsRead') {
      message.status = 'read'
    } else if (body.action === 'reply' && body.reply) {
      message.reply = body.reply
      message.status = 'replied'
      message.repliedAt = new Date()

      try {
        await sendReplyEmail({
          to: message.email,
          name: message.name,
          originalMessage: message.message,
          reply: body.reply
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
      }
    } else {
      if (body.status) message.status = body.status
      if (body.reply) {
        message.reply = body.reply
        message.repliedAt = new Date()
      }
    }

    await message.save()

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { id } = params

    const message = await Message.findByIdAndDelete(id)
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
