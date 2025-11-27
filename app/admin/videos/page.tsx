'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Swal from 'sweetalert2'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ReactPlayer from 'react-player'
import * as FaIcons from 'react-icons/fa'

const videoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().url('Valid URL is required'),
  embedType: z.enum(['embed', 'link'])
})

type Video = z.infer<typeof videoSchema> & { _id?: string }

export default function VideosManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<Video>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      embedType: 'embed'
    }
  })

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return ReactPlayer.canPlay(url)
    } catch {
      return false
    }
  }

  const getPlatformName = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
    if (url.includes('vimeo.com')) return 'Vimeo'
    if (url.includes('dailymotion.com')) return 'Dailymotion'
    return 'Video'
  }

  const watchUrl = watch('url')
  const watchEmbedType = watch('embedType')
  const showPreview = watchUrl && isValidUrl(watchUrl)

  // عرض معاينة الفيديو فور إدخال الرابط
  useEffect(() => {
    if (watchUrl && isValidUrl(watchUrl)) {
      setPreviewUrl(watchUrl)
    } else {
      setPreviewUrl('')
    }
  }, [watchUrl])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchVideos()
    }
  }, [status, router])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (!response.ok) throw new Error('Failed to fetch videos')
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error('Error fetching videos:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch videos',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    }
  }

  const onSubmit = async (data: Video) => {
    try {
      setIsSubmitting(true)

      if (editingVideo && editingVideo._id) {
        const response = await fetch(`/api/videos/${editingVideo._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Failed to update video')
        Swal.fire({
          title: 'Updated!',
          text: 'Video updated successfully',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
      } else {
        const response = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Failed to create video')
        Swal.fire({
          title: 'Created!',
          text: 'Video created successfully',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
      }
      reset()
      setEditingVideo(null)
      setPreviewUrl('')
      fetchVideos()
    } catch (error) {
      console.error('Error saving video:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save video',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteVideo = async (id: string) => {
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
        const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete video')
        Swal.fire({
          title: 'Deleted!',
          text: 'Video has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
        fetchVideos()
      } catch (error) {
        console.error('Error deleting video:', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete video',
          icon: 'error',
          confirmButtonColor: '#d33'
        })
      }
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-coffee-light to-amber-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
          <p className="text-coffee-dark text-lg">Loading Videos Manager...</p>
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
              Videos Manager
            </h1>
            <p className="text-coffee-medium text-lg">
              Manage and organize your video content
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
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl"
          >
            <div className="card-body p-6 lg:p-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark mb-6 flex items-center gap-3">
                <FaIcons.FaVideo className="text-coffee-brown" />
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>

              <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    className={`input input-bordered w-full bg-white/50 backdrop-blur-sm ${errors.title ? 'input-error border-2' : 'border-coffee-light'
                      } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20`}
                    placeholder="e.g., Advanced Latte Art Techniques"
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

                {/* Description Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    className={`textarea textarea-bordered w-full bg-white/50 backdrop-blur-sm ${errors.description ? 'textarea-error border-2' : 'border-coffee-light'
                      } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20 resize-none`}
                    placeholder="Describe the video content, techniques used, or key takeaways..."
                    rows={4}
                  />
                  {errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-2"
                    >
                      <FaIcons.FaExclamationTriangle />
                      {errors.description.message}
                    </motion.p>
                  )}
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Video URL *
                  </label>
                  <div className="relative">
                    <FaIcons.FaLink className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-medium z-10" />
                    <input
                      type="url"
                      {...register('url')}
                      className={`input input-bordered w-full pl-12 bg-white/50 backdrop-blur-sm ${errors.url ? 'input-error border-2' : 'border-coffee-light'
                        } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20`}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  {errors.url && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-2"
                    >
                      <FaIcons.FaExclamationTriangle />
                      {errors.url.message}
                    </motion.p>
                  )}
                  {watchUrl && !isValidUrl(watchUrl) && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-amber-600 text-sm mt-2 flex items-center gap-2"
                    >
                      <FaIcons.FaExclamationTriangle />
                      This URL may not be supported for embedding
                    </motion.p>
                  )}
                </div>

                {/* Embed Type */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Display Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'embed', label: 'Embed Video', icon: FaIcons.FaPlay },
                      { value: 'link', label: 'External Link', icon: FaIcons.FaExternalLinkAlt }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setValue('embedType', option.value as any)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${watchEmbedType === option.value
                            ? 'bg-coffee-brown border-coffee-brown text-white'
                            : 'bg-white/50 border-coffee-light text-coffee-dark hover:border-coffee-medium'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <option.icon className="text-lg" />
                          <span className="font-semibold">{option.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Video Preview */}
                <AnimatePresence>
                  {showPreview ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <label className="block text-coffee-dark font-semibold">
                        Video Preview - {getPlatformName(previewUrl)}
                      </label>
                      <div className="relative rounded-xl overflow-hidden border-2 border-coffee-light bg-black">
                        <ReactPlayer
                          url={previewUrl}
                          width="100%"
                          height="240px"
                          controls
                          light={true}
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="btn flex-1 bg-coffee-brown hover:bg-coffee-dark border-none text-white text-lg py-4 rounded-xl disabled:bg-coffee-medium transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="loading loading-spinner loading-sm"></div>
                        {editingVideo ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <FaIcons.FaCheck />
                        {editingVideo ? 'Update Video' : 'Add Video'}
                      </div>
                    )}
                  </motion.button>

                  {editingVideo && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setEditingVideo(null)
                        reset()
                        setPreviewUrl('')
                      }}
                      className="btn btn-ghost text-coffee-dark border-coffee-light hover:bg-coffee-light hover:border-coffee-medium"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>

          {/* Videos List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl"
          >
            <div className="card-body p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark flex items-center gap-3">
                  <FaIcons.FaList className="text-coffee-brown" />
                  Videos Library
                </h2>
                <span className="badge bg-coffee-brown text-white px-3 py-2 text-sm">
                  {videos.length} items
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {videos.map((video, index) => (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-coffee-light hover:shadow-coffee transition-all duration-300"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-black shrink-0">
                        {isValidUrl(video.url) ? (
                          <ReactPlayer
                            url={video.url}
                            width="100%"
                            height="100%"
                            light={true}
                            playIcon={null}
                          />
                        ) : (
                          <div className="w-full h-full bg-coffee-brown flex items-center justify-center">
                            <FaIcons.FaVideo className="text-white text-sm" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1">
                          <span className={`badge badge-xs ${video.embedType === 'embed'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-500 text-white'
                            }`}>
                            {video.embedType}
                          </span>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="grow min-w-0">
                        <h3 className="font-bold text-coffee-dark truncate">
                          {video.title}
                        </h3>
                        <p className="text-coffee-medium text-sm line-clamp-2 mb-1">
                          {video.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-coffee-light">
                          <FaIcons.FaLink />
                          <span className="truncate">{video.url}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingVideo(video)
                            reset(video)
                            setPreviewUrl(video.url)
                          }}
                          className="btn btn-sm bg-coffee-light border-coffee-light text-coffee-dark hover:bg-coffee-medium hover:border-coffee-medium"
                          title="Edit video"
                        >
                          <FaIcons.FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => video._id && deleteVideo(video._id)}
                          className="btn btn-sm btn-error text-white border-none"
                          title="Delete video"
                        >
                          <FaIcons.FaTrash />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {videos.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FaIcons.FaVideo className="text-coffee-medium text-6xl mx-auto mb-4" />
                    <p className="text-coffee-medium text-lg">
                      No videos added yet
                    </p>
                    <p className="text-coffee-light text-sm mt-2">
                      Add your first video using the form
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
