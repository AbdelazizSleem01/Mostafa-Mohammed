'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Swal from 'sweetalert2'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import * as FaIcons from 'react-icons/fa'

const gallerySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.any().refine((files) => files?.length > 0, 'Image is required')
})

type GalleryItem = {
  _id?: string
  title: string
  imageUrl: string
  cloudinaryId: string
}

type FormData = {
  title: string
  image: FileList
}

export default function GalleryManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(gallerySchema)
  })

  const watchImage = watch('image')

  // عرض الصورة فور اختيارها
  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0]
      const imageUrl = URL.createObjectURL(file)
      setPreviewImage(imageUrl)
      
      // تنظيف الذاكرة عند إلغاء المكون
      return () => {
        URL.revokeObjectURL(imageUrl)
      }
    } else {
      setPreviewImage(null)
    }
  }, [watchImage])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchGallery()
    }
  }, [status, router])

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery')
      if (!response.ok) throw new Error('Failed to fetch gallery')
      const data = await response.json()
      setGallery(data)
    } catch (error) {
      console.error('Error fetching gallery:', error)
      Swal.fire('Error!', 'Failed to fetch gallery items', 'error')
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('image', data.image[0])

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload image')

      Swal.fire({
        title: 'Success!',
        text: 'Image uploaded successfully',
        icon: 'success',
        confirmButtonColor: '#6F4E37'
      })
      
      reset()
      setPreviewImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      fetchGallery()
    } catch (error) {
      console.error('Error uploading image:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload image',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6F4E37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
      color: '#333'
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete image')
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Image has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
        fetchGallery()
      } catch (error) {
        console.error('Error deleting image:', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete image',
          icon: 'error',
          confirmButtonColor: '#d33'
        })
      }
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-coffee-light to-amber-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
          <p className="text-coffee-dark">Loading Gallery Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-coffee-light to-amber-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-coffee-dark mb-2">
              Gallery Manager
            </h1>
            <p className="text-coffee-medium text-lg">
              Upload and manage your gallery images
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/dashboard')}
            className="btn bg-coffee-brown hover:bg-coffee-dark text-white border-none"
          >
            <FaIcons.FaArrowLeft className="mr-2" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-white/80 backdrop-blur-sm shadow-coffee border-2 border-coffee-light rounded-2xl"
          >
            <div className="card-body p-6 lg:p-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark mb-6 flex items-center gap-3">
                <FaIcons.FaUpload className="text-coffee-brown" />
                Add New Image
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Image Title *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    className={`input input-bordered w-full bg-white/50 backdrop-blur-sm ${
                      errors.title ? 'input-error border-2' : 'border-coffee-light'
                    } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20`}
                    placeholder="e.g., Beautiful Latte Art"
                  />
                  {errors.title && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-2"
                    >
                      <FaIcons.FaExclamationTriangle />
                      {errors.title.message}
                    </motion.p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Select Image *
                  </label>
                  
                  {/* Custom File Upload */}
                  <div
                    onClick={handleFileClick}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      errors.image 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-coffee-light bg-white/50 hover:border-coffee-brown hover:bg-coffee-light/30'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      {...register('image')}
                      ref={(e) => {
                        register('image').ref(e)
                        if (e) fileInputRef.current = e
                      }}
                      className="hidden"
                    />
                    
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-coffee-brown rounded-2xl flex items-center justify-center mx-auto">
                        <FaIcons.FaCloudUploadAlt className="text-white text-2xl" />
                      </div>
                      
                      <div>
                        <p className="text-coffee-dark font-semibold mb-2">
                          Click to upload your image
                        </p>
                        <p className="text-coffee-medium text-sm">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {errors.image && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-2"
                    >
                      <FaIcons.FaExclamationTriangle />
                      {errors.image.message as string}
                    </motion.p>
                  )}
                </div>

                {/* Image Preview */}
                <AnimatePresence>
                  {previewImage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <label className="block text-coffee-dark font-semibold">
                        Image Preview
                      </label>
                      <div className="relative rounded-xl overflow-hidden border-2 border-coffee-light bg-white/50">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                          <FaIcons.FaEye className="text-white text-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploading}
                  className="btn w-full bg-coffee-brown hover:bg-coffee-dark border-none text-white text-lg py-4 rounded-xl disabled:bg-coffee-medium transition-all duration-300"
                >
                  {uploading ? (
                    <div className="flex items-center gap-3">
                      <div className="loading loading-spinner loading-sm"></div>
                      Uploading Image...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FaIcons.FaCheck />
                      Upload Image
                    </div>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Gallery List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-white/80 backdrop-blur-sm shadow-coffee border-2 border-coffee-light rounded-2xl"
          >
            <div className="card-body p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark flex items-center gap-3">
                  <FaIcons.FaImages className="text-coffee-brown" />
                  Gallery Images
                </h2>
                <span className="badge bg-coffee-brown text-white px-3 py-2 text-sm">
                  {gallery.length} items
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {gallery.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-coffee-light hover:shadow-coffee transition-all duration-300"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="grow min-w-0">
                        <h3 className="font-semibold text-coffee-dark truncate">
                          {item.title}
                        </h3>
                        <p className="text-coffee-medium text-sm truncate">
                          {item.imageUrl.split('/').pop()}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => item._id && deleteImage(item._id)}
                        className="btn btn-error btn-sm text-white border-none rounded-lg"
                        title="Delete image"
                      >
                        <FaIcons.FaTrash />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {gallery.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FaIcons.FaImages className="text-coffee-medium text-6xl mx-auto mb-4" />
                    <p className="text-coffee-medium text-lg">
                      No images uploaded yet
                    </p>
                    <p className="text-coffee-light text-sm mt-2">
                      Upload your first image using the form
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}