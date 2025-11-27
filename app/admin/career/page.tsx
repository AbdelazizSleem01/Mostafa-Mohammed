'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Swal from 'sweetalert2'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as FaIcons from 'react-icons/fa'

const careerSchema = z.object({
  workplace: z.string().min(1, 'Workplace is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean()
})

type CareerFormData = z.infer<typeof careerSchema>
type CareerItem = CareerFormData & { _id?: string }

export default function CareerManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [career, setCareer] = useState<CareerItem[]>([])
  const [editingItem, setEditingItem] = useState<CareerItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      isCurrent: false
    }
  })

  const isCurrent = watch('isCurrent')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchCareer()
    }
  }, [status, router])

  // Clear end date when "current job" is checked
  useEffect(() => {
    if (isCurrent) {
      setValue('endDate', '')
    }
  }, [isCurrent, setValue])

  const fetchCareer = async () => {
    try {
      const response = await fetch('/api/career')
      if (!response.ok) throw new Error('Failed to fetch career')
      const data = await response.json()
      // Sort by start date (newest first)
      const sortedData = data.sort((a: CareerItem, b: CareerItem) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      setCareer(sortedData)
    } catch (error) {
      console.error('Error fetching career:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch career items',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    }
  }

  const onSubmit = async (data: CareerFormData) => {
    try {
      setIsSubmitting(true)
      
      // Prepare data for API
      const submitData = {
        ...data,
        endDate: data.isCurrent ? undefined : data.endDate
      }

      if (editingItem && editingItem._id) {
        const response = await fetch(`/api/career/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })
        if (!response.ok) throw new Error('Failed to update career item')
        Swal.fire({
          title: 'Updated!',
          text: 'Career item updated successfully',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
      } else {
        const response = await fetch('/api/career', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })
        if (!response.ok) throw new Error('Failed to create career item')
        Swal.fire({
          title: 'Created!',
          text: 'Career item created successfully',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
      }
      reset()
      setEditingItem(null)
      fetchCareer()
    } catch (error) {
      console.error('Error saving career item:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save career item',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteCareerItem = async (id: string) => {
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
        const response = await fetch(`/api/career/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete career item')
        Swal.fire({
          title: 'Deleted!',
          text: 'Career item has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6F4E37'
        })
        fetchCareer()
      } catch (error) {
        console.error('Error deleting career item:', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete career item',
          icon: 'error',
          confirmButtonColor: '#d33'
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const calculateDuration = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = new Date(startDate)
    const end = isCurrent ? new Date() : new Date(endDate || '')
    
    const years = end.getFullYear() - start.getFullYear()
    const months = end.getMonth() - start.getMonth()
    
    let totalMonths = years * 12 + months
    if (totalMonths < 0) totalMonths = 0
    
    const yearsPart = Math.floor(totalMonths / 12)
    const monthsPart = totalMonths % 12
    
    if (yearsPart === 0 && monthsPart === 0) return 'Less than 1 month'
    
    const parts = []
    if (yearsPart > 0) parts.push(`${yearsPart} yr${yearsPart > 1 ? 's' : ''}`)
    if (monthsPart > 0) parts.push(`${monthsPart} mo${monthsPart > 1 ? 's' : ''}`)
    
    return parts.join(' ')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-coffee-light to-amber-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
          <p className="text-coffee-dark">Loading Career Manager...</p>
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
              Career Manager
            </h1>
            <p className="text-coffee-medium text-lg">
              Manage your professional work experience and career timeline
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
            className="card bg-white/80 backdrop-blur-sm shadow-coffee border-2 border-coffee-light rounded-2xl"
          >
            <div className="card-body p-6 lg:p-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark mb-6 flex items-center gap-3">
                <FaIcons.FaBriefcase className="text-coffee-brown" />
                {editingItem ? 'Edit Career Item' : 'Add New Career Item'}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Workplace Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Workplace *
                  </label>
                  <input
                    type="text"
                    {...register('workplace')}
                    className={`input input-bordered w-full bg-white/50 backdrop-blur-sm ${
                      errors.workplace ? 'input-error border-2' : 'border-coffee-light'
                    } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20`}
                    placeholder="e.g., Starbucks Coffee Company"
                  />
                  {errors.workplace && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-2"
                    >
                      <FaIcons.FaExclamationTriangle />
                      {errors.workplace.message}
                    </motion.p>
                  )}
                </div>

                {/* Position Input */}
                <div>
                  <label className="block text-coffee-dark font-semibold mb-3">
                    Position *
                  </label>
                  <input
                    type="text"
                    {...register('position')}
                    className={`input input-bordered w-full bg-white/50 backdrop-blur-sm ${
                      errors.position ? 'input-error border-2' : 'border-coffee-light'
                    } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20`}
                    placeholder="e.g., Head Barista & Trainer"
                  />
                  {errors.position && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-2"
                    >
                      <FaIcons.FaExclamationTriangle />
                      {errors.position.message}
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-coffee-dark font-semibold mb-3">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className={`input input-bordered w-full bg-white/50 backdrop-blur-sm ${
                        errors.startDate ? 'input-error border-2' : 'border-coffee-light'
                      } rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20`}
                    />
                    {errors.startDate && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-2 flex items-center gap-2"
                      >
                        <FaIcons.FaExclamationTriangle />
                        {errors.startDate.message}
                      </motion.p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-coffee-dark font-semibold mb-3">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className="input input-bordered w-full bg-white/50 backdrop-blur-sm border-coffee-light rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20 disabled:bg-gray-100 disabled:text-gray-400"
                      disabled={isCurrent}
                    />
                  </div>
                </div>

                {/* Current Job Checkbox */}
                <div className="flex items-center gap-4 p-4 bg-coffee-light/30 rounded-xl border border-coffee-light">
                  <input
                    type="checkbox"
                    {...register('isCurrent')}
                    className="checkbox bg-white border-coffee-medium checked:bg-coffee-brown checked:border-coffee-brown"
                  />
                  <div>
                    <label className="block text-coffee-dark font-semibold cursor-pointer">
                      I currently work here
                    </label>
                    <p className="text-coffee-medium text-sm">
                      Leave end date empty if this is your current position
                    </p>
                  </div>
                </div>

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
                        {editingItem ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <FaIcons.FaCheck />
                        {editingItem ? 'Update Career Item' : 'Add Career Item'}
                      </div>
                    )}
                  </motion.button>
                  
                  {editingItem && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setEditingItem(null)
                        reset()
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

          {/* Career Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-white/80 backdrop-blur-sm shadow-coffee border-2 border-coffee-light rounded-2xl"
          >
            <div className="card-body p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark flex items-center gap-3">
                  <FaIcons.FaHistory className="text-coffee-brown" />
                  Career Timeline
                </h2>
                <span className="badge bg-coffee-brown text-white px-3 py-2 text-sm">
                  {career.length} items
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {career.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-coffee-light hover:shadow-coffee transition-all duration-300"
                    >
                      {/* Timeline Dot */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-4 h-4 rounded-full ${
                          item.isCurrent ? 'bg-green-500 ring-4 ring-green-200' : 'bg-coffee-brown'
                        }`} />
                        {index < career.length - 1 && (
                          <div className="w-0.5 h-12 bg-coffee-light mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="grow min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-coffee-dark text-lg">
                              {item.position}
                            </h3>
                            <p className="text-coffee-brown font-semibold">
                              {item.workplace}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${
                              item.isCurrent 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-coffee-light text-coffee-dark border-coffee-medium'
                            } border`}>
                              {item.isCurrent ? (
                                <FaIcons.FaPlayCircle className="mr-1" />
                              ) : (
                                <FaIcons.FaCheckCircle className="mr-1" />
                              )}
                              {item.isCurrent ? 'Current' : 'Completed'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-coffee-medium">
                          <div className="flex items-center gap-2">
                            <FaIcons.FaCalendarAlt className="text-coffee-brown" />
                            <span>
                              {formatDate(item.startDate)} - {' '}
                              {item.isCurrent ? 'Present' : formatDate(item.endDate || '')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaIcons.FaClock className="text-coffee-brown" />
                            <span>
                              {calculateDuration(item.startDate, item.endDate, item.isCurrent)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingItem(item)
                            reset(item)
                          }}
                          className="btn btn-sm bg-coffee-light border-coffee-light text-coffee-dark hover:bg-coffee-medium hover:border-coffee-medium"
                          title="Edit"
                        >
                          <FaIcons.FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => item._id && deleteCareerItem(item._id)}
                          className="btn btn-sm btn-error text-white border-none"
                          title="Delete"
                        >
                          <FaIcons.FaTrash />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {career.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FaIcons.FaBriefcase className="text-coffee-medium text-6xl mx-auto mb-4" />
                    <p className="text-coffee-medium text-lg">
                      No career items added yet
                    </p>
                    <p className="text-coffee-light text-sm mt-2">
                      Add your first career experience using the form
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