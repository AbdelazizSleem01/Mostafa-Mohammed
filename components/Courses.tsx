'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaGraduationCap,
  FaClock,
  FaUsers,
  FaStar,
  FaArrowRight,
  FaCoffee,
  FaMugHot,
  FaSeedling,
  FaFire,
  FaAward
} from 'react-icons/fa'

interface Course {
  _id: string
  name: string
  description: string
  createdAt: string
}

// أيقونات مختلفة للكورسات
const courseIcons = [
  FaCoffee, FaMugHot, FaSeedling, FaGraduationCap, FaFire, FaAward
]

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  const hoverVariants = {
    y: -8,
    scale: 1.02
  }

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-linear-to-br from-amber-50 to-coffee-light">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-coffee-brown rounded-full mb-6"
            >
              <FaGraduationCap className="text-white text-2xl" />
            </motion.div>
            <h2 className="text-4xl font-bold text-center text-coffee-dark mb-12">
              Coffee Courses
            </h2>
            <div className="loading loading-spinner loading-lg text-coffee-brown"></div>
            <p className="text-coffee-dark mt-4">Loading courses...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="courses" className="py-20 bg-linear-to-br from-amber-50 to-coffee-light relative overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl">📚</div>
        <div className="absolute top-1/4 right-20 text-4xl">🎓</div>
        <div className="absolute bottom-20 left-20 text-5xl">✨</div>
        <div className="absolute bottom-10 right-10 text-6xl">🌟</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-coffee-brown to-amber-700 rounded-full mb-6"
          >
            <FaGraduationCap className="text-white text-2xl" />
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold text-coffee-dark mb-6">
            Professional <span className="text-coffee-brown">Courses</span>
          </h2>

          <p className="text-xl text-coffee-medium max-w-2xl mx-auto leading-relaxed">
            Master the art of coffee through comprehensive courses designed for
            both beginners and experienced baristas.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <AnimatePresence>
          {courses.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {courses.map((course, index) => {
                const IconComponent = courseIcons[index % courseIcons.length]
                return (
                  <motion.div
                    key={course._id}
                    variants={itemVariants}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="group cursor-pointer"
                  >
                    <motion.div
                      whileHover={hoverVariants}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="card bg-white/90 backdrop-blur-sm border-2 border-coffee-light shadow-coffee hover:shadow-coffee-lg transition-all duration-500 group-hover:border-coffee-medium relative overflow-hidden h-full"
                    >
                      {/* تأثير خلفية عند hover */}
                      <div className="absolute inset-0 bg-linear-to-br from-coffee-brown to-amber-700 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />

                      <div className="card-body p-8 relative z-10">
                        {/* أيقونة الكورس */}
                        <motion.div
                          initial={{ scale: 0.8, rotate: -10 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.1, type: "spring" }}
                          className="flex justify-center mb-6"
                        >
                          <div className="relative">
                            <div className="w-16 h-16 bg-linear-to-br from-coffee-brown to-amber-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <IconComponent className="text-white text-2xl" />
                            </div>
                            {/* تأثير دائري متحرك */}
                            <motion.div
                              className="absolute inset-0 border-2 border-coffee-brown rounded-2xl opacity-30"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                        </motion.div>

                        {/* اسم الكورس */}
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="card-title justify-center text-coffee-dark text-xl font-bold mb-4 group-hover:text-coffee-brown transition-colors duration-300 text-center"
                        >
                          {course.name}
                        </motion.h3>

                        {/* وصف الكورس */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="text-coffee-dark opacity-80 leading-relaxed text-center mb-6 flex-grow"
                        >
                          {course.description}
                        </motion.p>

                        {/* زر Learn More */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-outline border-coffee-brown text-coffee-dark hover:bg-coffee-brown hover:text-white w-full flex items-center justify-center gap-2 group/btn"
                        >
                          Learn More
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="group-hover/btn:translate-x-1 transition-transform"
                          >
                            <FaArrowRight />
                          </motion.span>
                        </motion.button>

                        {/* تأثير تحت الكارد */}
                        <motion.div
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-linear-to-r from-coffee-brown to-amber-700 group-hover:w-3/4 transition-all duration-500 rounded-full"
                          whileInView={{ width: "50%" }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl text-coffee-dark mb-4">Courses Coming Soon</h3>
              <p className="text-coffee-medium text-lg max-w-md mx-auto">
                Exciting coffee courses are in development.
                Check back soon to elevate your barista skills!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-coffee-light shadow-coffee">
            <h3 className="text-2xl font-bold text-coffee-dark mb-4">
              Ready to Master Coffee Art?
            </h3>
            <p className="text-coffee-medium mb-6">
              Join our courses and transform your passion for coffee into professional expertise.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary bg-coffee-brown border-coffee-brown hover:bg-coffee-dark text-white px-3 py-3 text-lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Enroll Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
