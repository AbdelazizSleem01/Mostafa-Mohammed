import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import Certificate from '@/models/Certificate'
import { v2 as cloudinary } from 'cloudinary'
import { authOptions } from '../../auth/[...nextauth]/route'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
    const certificate = await Certificate.findById(id)
    
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const date = formData.get('date') as string | null
    const image = formData.get('image') as File | null

    // Update title and date
    certificate.title = title
    if (date) {
      certificate.date = date
    }

    // If new image is provided, update it
    if (image && image.size > 0) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(certificate.cloudinaryId)

      // Upload new image
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'certificates' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      certificate.imageUrl = uploadResult.secure_url
      certificate.cloudinaryId = uploadResult.public_id
    }

    await certificate.save()
    
    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Error updating certificate:', error)
    return NextResponse.json(
      { error: 'Failed to update certificate' },
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
    const certificate = await Certificate.findById(id)
    
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    await cloudinary.uploader.destroy(certificate.cloudinaryId)

    await Certificate.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Certificate deleted successfully' })
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { error: 'Failed to delete certificate' },
      { status: 500 }
    )
  }
}