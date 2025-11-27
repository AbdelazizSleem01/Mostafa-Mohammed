'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, easeOut, easeIn, easeInOut } from 'framer-motion'
import Image from 'next/image'
import * as FaIcons from 'react-icons/fa'

interface GalleryItem {
  _id: string
  title: string
  imageUrl: string
  description?: string
}

export default function Gallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [carouselView, setCarouselView] = useState(false)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        setGallery(data)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (item: GalleryItem, index: number) => {
    setSelectedImage(item)
    setCurrentIndex(index)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const nextImage = useCallback(() => {
    if (gallery.length === 0) return
    setDirection(0)
    const nextIndex = (currentIndex + 1) % gallery.length
    setCurrentIndex(nextIndex)
    setSelectedImage(gallery[nextIndex])
  }, [gallery, currentIndex])

  const prevImage = useCallback(() => {
    if (gallery.length === 0) return
    setDirection(1)
    const prevIndex = (currentIndex - 1 + gallery.length) % gallery.length
    setCurrentIndex(prevIndex)
    setSelectedImage(gallery[prevIndex])
  }, [gallery, currentIndex])

  useEffect(() => {
    if (!carouselView || gallery.length <= 1) return

    const interval = setInterval(() => {
      setDirection(0)
      setCurrentIndex(prev => (prev + 1) % gallery.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [carouselView, gallery.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return

      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, nextImage, prevImage])

  const nextCarousel = useCallback(() => {
    setDirection(0)
    setCurrentIndex(prev => (prev + 1) % gallery.length)
  }, [gallery.length])

  const prevCarousel = useCallback(() => {
    setDirection(1)
    setCurrentIndex(prev => (prev - 1 + gallery.length) % gallery.length)
  }, [gallery.length])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction === 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: easeOut
      }
    },
    exit: (direction: number) => ({
      x: direction === 0 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.4,
        ease: easeIn
      }
    })
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
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: easeOut
      }
    }
  }

  const hoverVariants = {
    hover: {
      y: -8,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: easeInOut
      }
    }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: easeOut
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: easeIn
      }
    }
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-linear-to-br from-coffee-light to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
            <p className="text-coffee-dark text-lg">Loading Gallery...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" className="py-20 bg-linear-to-br from-white to-amber-50 relative overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl">🖼️</div>
        <div className="absolute top-1/4 right-20 text-4xl">📸</div>
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
            className="inline-flex items-center justify-center w-20 h-20 bg-coffee-brown rounded-full mb-6"
          >
            <FaIcons.FaImages className="text-white text-2xl" />
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold text-coffee-dark mb-6">
            Photo <span className="text-coffee-brown">Gallery</span>
          </h2>

          <p className="text-xl text-coffee-medium max-w-2xl mx-auto leading-relaxed">
            Explore our visual journey through the art of coffee. From bean to cup,
            witness the beauty and craftsmanship behind every brew.
          </p>

          {/* View Toggle */}
          {gallery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center mt-8"
            >
              <div className="bg-coffee-light rounded-2xl p-2 flex gap-2">
                <button
                  onClick={() => setCarouselView(false)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${!carouselView
                      ? 'bg-coffee-brown text-white shadow-lg'
                      : 'text-coffee-dark hover:bg-white/50'
                    }`}
                >
                  <FaIcons.FaTh className="inline mr-2" />
                  Grid View
                </button>
                <button
                  onClick={() => setCarouselView(true)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${carouselView
                      ? 'bg-coffee-brown text-white shadow-lg'
                      : 'text-coffee-dark hover:bg-white/50'
                    }`}
                >
                  <FaIcons.FaPlay className="inline mr-2" />
                  Carousel View
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Carousel View */}
        {carouselView && gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto mb-16"
          >
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-coffee-light shadow-coffee p-8">
              {/* Carousel Container */}
              <div className="relative h-[500px] lg:h-[600px] flex items-center justify-center">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={() => openModal(gallery[currentIndex], currentIndex)}
                  >
                    <div className="relative w-full h-full max-w-4xl mx-auto">
                      <Image
                        src={gallery[currentIndex].imageUrl}
                        alt={gallery[currentIndex].title}
                        fill
                        className="object-contain rounded-2xl"
                        priority
                        loading="eager"
                      />

                      {/* Overlay Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                        <h3 className="text-white text-2xl lg:text-3xl font-bold mb-2">
                          {gallery[currentIndex].title}
                        </h3>
                        {gallery[currentIndex].description && (
                          <p className="text-white/80 text-lg">
                            {gallery[currentIndex].description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {gallery.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevCarousel}
                      className="absolute left-4 lg:left-8 w-12 h-12 bg-coffee-brown/90 hover:bg-coffee-dark text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300"
                      aria-label="Previous image"
                    >
                      <FaIcons.FaChevronLeft className="text-lg" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextCarousel}
                      className="absolute right-4 lg:right-8 w-12 h-12 bg-coffee-brown/90 hover:bg-coffee-dark text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300"
                      aria-label="Next image"
                    >
                      <FaIcons.FaChevronRight className="text-lg" />
                    </motion.button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {gallery.length > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8 overflow-x-auto py-4">
                  {gallery.map((item, index) => (
                    <motion.button
                      key={item._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setDirection(index > currentIndex ? 0 : 1)
                        setCurrentIndex(index)
                      }}
                      className={`shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentIndex
                          ? 'border-coffee-brown scale-110 shadow-lg'
                          : 'border-coffee-light hover:border-coffee-medium'
                        }`}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Progress Indicator */}
              {gallery.length > 1 && (
                <div className="text-center mt-4">
                  <span className="text-coffee-medium bg-coffee-light/50 px-4 py-2 rounded-full text-sm">
                    {currentIndex + 1} / {gallery.length}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Grid View */}
        {!carouselView && (
          <AnimatePresence>
            {gallery.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {gallery.map((item, index) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    whileHover="hover"
                    className="group cursor-pointer"
                    onClick={() => openModal(item, index)}
                  >
                    <motion.div
                      variants={hoverVariants}
                      className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee hover:shadow-coffee-lg transition-all duration-500 group-hover:border-coffee-medium relative overflow-hidden rounded-xl"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-coffee-brown to-amber-700 opacity-0 group-hover:opacity-5 transition-opacity duration-500 z-10" />

                      {/* الصورة */}
                      <figure className="relative aspect-square overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />

                        {/* Overlay Effect */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            className="w-12 h-12 bg-coffee-brown/90 rounded-full flex items-center justify-center"
                          >
                            <FaIcons.FaExpand className="text-white text-lg" />
                          </motion.div>
                        </div>
                      </figure>

                      {/* العنوان */}
                      <div className="card-body p-4 relative z-20">
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="card-title text-coffee-dark text-sm font-bold group-hover:text-coffee-brown transition-colors duration-300 line-clamp-2"
                        >
                          {item.title}
                        </motion.h3>

                        {/* تأثير تحت الصورة */}
                        <motion.div
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-linear-to-r from-coffee-brown to-amber-700 group-hover:w-3/4 transition-all duration-500 rounded-full"
                          whileInView={{ width: "50%" }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-2xl text-coffee-dark mb-4">Gallery Coming Soon</h3>
                <p className="text-coffee-medium text-lg max-w-md mx-auto">
                  Amazing coffee moments and behind-the-scenes photos will be added here soon.
                  Stay tuned for visual stories from our coffee journey!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-coffee-light rounded-2xl p-8 max-w-2xl mx-auto border border-coffee-light shadow-coffee">
            <h3 className="text-2xl font-bold text-coffee-dark mb-4">
              Capture the Moment
            </h3>
            <p className="text-coffee-medium mb-6">
              Every photo tells a story of passion, precision, and the perfect brew.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary bg-coffee-brown border-coffee-brown hover:bg-coffee-dark text-white px-3 py-3 text-lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <FaIcons.FaCamera className="mr-2" />
              Share Your Moments
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modal للصورة المختارة */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative max-w-7xl max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* زر الإغلاق */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <FaIcons.FaTimes className="text-white text-lg" />
              </button>

              {/* أزرار التنقل */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-300"
                  >
                    <FaIcons.FaChevronLeft className="text-white text-xl" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-300"
                  >
                    <FaIcons.FaChevronRight className="text-white text-xl" />
                  </button>
                </>
              )}

              {/* الصورة في المودال */}
              <div className="relative w-full h-[70vh]">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* معلومات الصورة */}
              <div className="bg-white p-6 border-t border-coffee-light">
                <h3 className="text-2xl font-bold text-coffee-dark mb-2">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-coffee-medium">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 text-sm text-coffee-medium">
                  <span>Image {currentIndex + 1} of {gallery.length}</span>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-coffee-brown transition-colors">
                      <FaIcons.FaDownload />
                      Download
                    </button>
                    <button className="flex items-center gap-1 hover:text-coffee-brown transition-colors">
                      <FaIcons.FaShare />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
