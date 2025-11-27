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

const certificateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().optional(),
  image: z.any().optional()
})

type CertificateFormData = {
  title: string
  date?: string
  image?: FileList
}

interface Certificate {
  _id?: string
  title: string
  imageUrl: string
  cloudinaryId: string
  date?: string
}

export default function CertificatesManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema)
  })

  const watchImage = watch('image')

  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0]
      const imageUrl = URL.createObjectURL(file)
      setPreviewImage(imageUrl)

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
      fetchCertificates()
    }
  }, [status, router])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates')
      if (!response.ok) throw new Error('Failed to fetch certificates')
      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error('Error fetching certificates:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch certificates',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    }
  }

  const onSubmit = async (data: CertificateFormData) => {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('title', data.title)
      if (data.date) formData.append('date', data.date)

      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0])
      }

      const url = isEditMode && editingCertificate
        ? `/api/certificates/${editingCertificate._id}`
        : '/api/certificates'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'upload'} certificate`)
      }

      Swal.fire({
        title: 'Success!',
        text: `Certificate ${isEditMode ? 'updated' : 'uploaded'} successfully`,
        icon: 'success',
        confirmButtonColor: '#6F4E37'
      })

      reset()
      setPreviewImage(null)
      setIsEditMode(false)
      setEditingCertificate(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      fetchCertificates()
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'uploading'} certificate:`, error)
      Swal.fire({
        title: 'Error!',
        text: `Failed to ${isEditMode ? 'update' : 'upload'} certificate`,
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteCertificate = async (id: string) => {
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
        const response = await fetch(`/api/certificates/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete certificate')

        Swal.fire({
          title: 'Deleted!',
          text: 'Certificate has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
        fetchCertificates()
      } catch (error) {
        console.error('Error deleting certificate:', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete certificate',
          icon: 'error',
          confirmButtonColor: '#d33'
        })
      }
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const editCertificate = (cert: Certificate) => {
    setEditingCertificate(cert)
    setIsEditMode(true)
    setPreviewImage(cert.imageUrl)
    reset({
      title: cert.title,
      date: cert.date || '',
      image: undefined
    })
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setIsEditMode(false)
    setEditingCertificate(null)
    setPreviewImage(null)
    reset({
      title: '',
      date: '',
      image: undefined
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-coffee-light to-amber-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
          <p className="text-coffee-dark">Loading Certificates Manager...</p>
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
              Certificates Manager
            </h1>
            <p className="text-coffee-medium text-lg">
              Manage your professional certificates and achievements
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark flex items-center gap-3">
                  <FaIcons.FaAward className="text-coffee-brown" />
                  {isEditMode ? 'Edit Certificate' : 'Add New Certificate'}
                </h2>
                {isEditMode && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelEdit}
                    className="btn btn-ghost btn-sm text-coffee-medium"
                  >
                    <FaIcons.FaTimes className="mr-1" />
                    Cancel
                  </motion.button>
                )}
              </div>

              <form onSubmit={handleSubmit(data => onSubmit(data as unknown as CertificateFormData))} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    className={`input input-bordered w-full bg-white/50 backdrop-blur-sm ${errors.title ? 'input-error border-2' : 'border-coffee-light'
                      } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20`}
                    placeholder="e.g., Professional Barista Certification"
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

                {/* Date Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    className="input input-bordered w-full bg-white/50 backdrop-blur-sm border-coffee-light rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20"
                  />
                </div>

                {/* Certificate Upload */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Certificate Image {isEditMode ? '(Optional - leave empty to keep current)' : '*'}
                  </label>

                  {/* Custom File Upload */}
                  <div
                    onClick={handleFileClick}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${errors.image
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
                        <FaIcons.FaCertificate className="text-white text-2xl" />
                      </div>

                      <div>
                        <p className="text-coffee-dark font-semibold mb-2">
                          Click to upload certificate
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

                {/* Certificate Preview */}
                <AnimatePresence>
                  {previewImage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <label className="block text-coffee-dark font-semibold">
                        Certificate Preview
                      </label>
                      <div className="relative rounded-xl overflow-hidden border-2 border-coffee-light bg-white/50">
                        <Image
                          src={previewImage}
                          alt="Certificate Preview"
                          width={400}
                          height={300}
                          className="w-full h-48 object-contain bg-white"
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
                      Uploading Certificate...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FaIcons.FaAward />
                      {isEditMode ? 'Update Certificate' : 'Upload Certificate'}
                    </div>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Certificates List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-white/80 backdrop-blur-sm shadow-coffee border-2 border-coffee-light rounded-2xl"
          >
            <div className="card-body p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark flex items-center gap-3">
                  <FaIcons.FaCertificate className="text-coffee-brown" />
                  My Certificates
                </h2>
                <span className="badge bg-coffee-brown text-white px-3 py-2 text-sm">
                  {certificates.length} items
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {certificates.map((cert, index) => (
                    <motion.div
                      key={cert._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-coffee-light hover:shadow-coffee transition-all duration-300"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white border border-coffee-light">
                        <Image
                          src={cert.imageUrl}
                          alt={cert.title}
                          fill
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="grow min-w-0">
                        <h3 className="font-semibold text-coffee-dark truncate">
                          {cert.title}
                        </h3>
                        {cert.date && (
                          <p className="text-coffee-medium text-sm flex items-center gap-2 mt-1">
                            <FaIcons.FaCalendarAlt className="text-coffee-brown" />
                            {new Date(cert.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => editCertificate(cert)}
                          className="btn btn-info btn-sm text-white border-none rounded-lg"
                          title="Edit certificate"
                        >
                          <FaIcons.FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => cert._id && deleteCertificate(cert._id)}
                          className="btn btn-error btn-sm text-white border-none rounded-lg"
                          title="Delete certificate"
                        >
                          <FaIcons.FaTrash />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {certificates.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FaIcons.FaCertificate className="text-coffee-medium text-6xl mx-auto mb-4" />
                    <p className="text-coffee-medium text-lg">
                      No certificates uploaded yet
                    </p>
                    <p className="text-coffee-light text-sm mt-2">
                      Upload your first certificate using the form
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Certificates Grid View */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="card bg-white/80 backdrop-blur-sm shadow-coffee border-2 border-coffee-light rounded-2xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold text-coffee-dark mb-6 flex items-center gap-3">
                  <FaIcons.FaThLarge className="text-coffee-brown" />
                  Certificates Gallery
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert, index) => (
                    <motion.div
                      key={cert._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="card bg-white/50 backdrop-blur-sm border-2 border-coffee-light rounded-xl overflow-hidden hover:shadow-coffee-lg transition-all duration-300"
                    >
                      <figure className="relative h-48 bg-white">
                        <Image
                          src={cert.imageUrl}
                          alt={cert.title}
                          fill
                          className="object-contain p-4"
                        />
                      </figure>
                      <div className="card-body p-4">
                        <h4 className="card-title text-coffee-dark text-lg font-bold line-clamp-2">
                          {cert.title}
                        </h4>
                        {cert.date && (
                          <p className="text-coffee-medium text-sm flex items-center gap-2">
                            <FaIcons.FaCalendarAlt />
                            {new Date(cert.date).toLocaleDateString()}
                          </p>
                        )}
                        <div className="card-actions justify-end mt-3 gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => editCertificate(cert)}
                            className="btn btn-info btn-sm text-white border-none"
                          >
                            <FaIcons.FaEdit className="mr-1" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => cert._id && deleteCertificate(cert._id)}
                            className="btn btn-error btn-sm text-white border-none"
                          >
                            <FaIcons.FaTrash className="mr-1" />
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
