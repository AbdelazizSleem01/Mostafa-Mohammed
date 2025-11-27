'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Swal from 'sweetalert2'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaGraduationCap,
  FaListAlt,
  FaBook,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaClock,
  FaUsers
} from 'react-icons/fa'

const courseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  description: z.string().min(1, 'Description is required')
})

type Course = z.infer<typeof courseSchema> & { _id?: string }

export default function CoursesManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Course>({
    resolver: zodResolver(courseSchema)
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchCourses()
    }
  }, [status, router])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch courses',
        background: '#FAF3E4',
        color: '#6F4E37'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: Course) => {
    try {
      if (editingCourse && editingCourse._id) {
        const response = await fetch(`/api/courses/${editingCourse._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Failed to update course')

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Course updated successfully',
          background: '#FAF3E4',
          color: '#6F4E37',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Failed to create course')

        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Course created successfully',
          background: '#FAF3E4',
          color: '#6F4E37',
          timer: 2000,
          showConfirmButton: false
        })
      }
      reset()
      setEditingCourse(null)
      fetchCourses()
    } catch (error) {
      console.error('Error saving course:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to save course',
        background: '#FAF3E4',
        color: '#6F4E37'
      })
    }
  }

  const deleteCourse = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6F4E37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: '#FAF3E4',
      color: '#6F4E37'
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed to delete course')

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Course has been deleted.',
          background: '#FAF3E4',
          color: '#6F4E37',
          timer: 2000,
          showConfirmButton: false
        })
        fetchCourses()
      } catch (error) {
        console.error('Error deleting course:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete course',
          background: '#FAF3E4',
          color: '#6F4E37'
        })
      }
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-coffee-light to-amber-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
          <p className="text-coffee-dark">Loading Courses...</p>
        </motion.div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-coffee-light via-amber-50 to-coffee-light">
      {/* Header */}
     
        <div className=" mx-auto px-14 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/admin/dashboard')}
                className="btn btn-circle hover:bg-coffee-light text-coffee-dark"
              >
                <FaArrowLeft />

              </motion.button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-coffee-brown rounded-lg">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-coffee-dark">Courses Management</h1>
                  <p className="text-coffee-medium">Manage your coffee courses</p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-right"
            >
              <div className="stat-value text-coffee-brown text-center">{courses.length}</div>
              <div className="stat-desc text-coffee-medium">Total Courses</div>
            </motion.div>
          </div>
        </div>
    

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Add/Edit Form */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="card bg-white shadow-coffee-lg border border-coffee-light"
          >
            <div className="card-body p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-coffee-brown rounded-full">
                  {editingCourse ? (
                    <FaEdit className="text-white text-lg" />
                  ) : (
                    <FaPlus className="text-white text-lg" />
                  )}
                </div>
                <h2 className="card-title text-2xl text-coffee-dark">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Course Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-coffee-dark font-semibold text-lg flex items-center gap-2">
                        <FaBook />
                        Course Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`input input-bordered w-full bg-coffee-light border-coffee-medium text-coffee-dark text-lg py-3 ${errors.name ? 'input-error border-2' : ''
                        }`}
                      placeholder="e.g., Latte Art Masterclass, Coffee Brewing Fundamentals"
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-2 flex items-center gap-2"
                        >
                          ⚠️ {errors.name.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Course Description */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-coffee-dark font-semibold text-lg flex items-center gap-2">
                        <FaChalkboardTeacher />
                        Course Description *
                      </span>
                    </label>
                    <textarea
                      {...register('description')}
                      className={`textarea textarea-bordered w-full bg-coffee-light border-coffee-medium text-coffee-dark text-lg py-3 min-h-[120px] ${errors.description ? 'textarea-error border-2' : ''
                        }`}
                      placeholder="Describe the course content, objectives, and what students will learn..."
                      rows={4}
                    />
                    <AnimatePresence>
                      {errors.description && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-2 flex items-center gap-2"
                        >
                          ⚠️ {errors.description.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <label className="label">
                      <span className="label-text-alt text-coffee-medium">
                        Provide a comprehensive description of the course
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary btn-lg flex items-center gap-2 bg-coffee-brown border-coffee-brown hover:bg-coffee-dark"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading loading-spinner loading-sm"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        {editingCourse ? 'Update Course' : 'Add Course'}
                      </>
                    )}
                  </motion.button>

                  {editingCourse && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        setEditingCourse(null)
                        reset()
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn btn-outline btn-lg border-coffee-medium text-coffee-dark hover:bg-coffee-light flex items-center gap-2"
                    >
                      <FaTimes />
                      Cancel
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>

          {/* Courses List */}
          <motion.div
            variants={itemVariants}
            className="card bg-white shadow-coffee-lg border border-coffee-light"
          >
            <div className="card-body p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-coffee-brown rounded-full">
                    <FaListAlt className="text-white text-lg" />
                  </div>
                  <h2 className="card-title text-2xl text-coffee-dark">
                    Courses List
                  </h2>
                </div>
                <div className="badge badge-primary badge-lg bg-coffee-brown border-coffee-brown text-white p-4">
                  {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <AnimatePresence>
                  {courses.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl text-coffee-dark mb-2">No Courses Yet</h3>
                      <p className="text-coffee-medium">
                        Add your first course using the form above
                      </p>
                    </motion.div>
                  ) : (
                    <motion.table
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="table table-zebra w-full"
                    >
                      <thead>
                        <tr className="bg-coffee-light">
                          <th className="text-coffee-dark font-bold text-lg">Course Name</th>
                          <th className="text-coffee-dark font-bold text-lg">Description</th>
                          <th className="text-coffee-dark font-bold text-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course, index) => (
                          <motion.tr
                            key={course._id}
                            variants={itemVariants}
                            whileHover={{
                              backgroundColor: "rgba(250, 243, 228, 0.5)",
                              scale: 1.01
                            }}
                            className="border-b border-coffee-light"
                          >
                            <td className="font-semibold text-coffee-dark text-lg py-4">
                              <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-green-500" />
                                <div>
                                  <div className="font-bold">{course.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-coffee-dark py-4">
                              <div className="max-w-md">
                                {course.description}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => {
                                    setEditingCourse(course)
                                    reset(course)
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-sm btn-outline border-coffee-brown text-coffee-dark hover:bg-coffee-brown hover:text-white flex items-center gap-2"
                                >
                                  <FaEdit />
                                  Edit
                                </motion.button>
                                <motion.button
                                  onClick={() => course._id && deleteCourse(course._id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-sm btn-error bg-red-500 border-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                                >
                                  <FaTrash />
                                  Delete
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </motion.table>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}