'use client'

import { motion } from 'framer-motion'

const CoffeeBeanSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" className="text-coffee-brown">
    <motion.path
      d="M20 5 C25 5 35 10 35 20 C35 30 25 35 20 35 C15 35 5 30 5 20 C5 10 15 5 20 5 Z"
      fill="currentColor"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.path
      d="M15 12 C18 10 22 10 25 12"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
    />
  </svg>
)

const CoffeeCupSVG = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="text-coffee-medium">
    <motion.path
      d="M15 20 L15 40 C15 45 20 50 25 50 L35 50 C40 50 45 45 45 40 L45 20 Z"
      fill="currentColor"
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.path
      d="M10 20 L50 20"
      stroke="currentColor"
      strokeWidth="3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.path
      d="M50 25 L55 20 L55 15 L50 20 Z"
      fill="currentColor"
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </svg>
)

const SteamSVG = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" className="text-gray-300">
    <motion.path
      d="M15 5 C12 0 18 0 15 5 C12 10 18 10 15 15 C12 20 18 20 15 25"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 1, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </svg>
)

export default function CoffeeAnimation() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      {/* حبوب قهوة SVG */}
      <motion.div
        className="absolute top-1/4 left-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <CoffeeBeanSVG />
      </motion.div>

      <motion.div
        className="absolute top-2/3 right-20"
        animate={{
          y: [0, -25, 0],
          rotate: [0, -20, 20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <CoffeeBeanSVG />
      </motion.div>

      {/* كوب قهوة رئيسي */}
      <motion.div
        className="absolute top-1/3 right-1/4"
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <CoffeeCupSVG />
      </motion.div>

      {/* بخار من الكوب */}
      <motion.div
        className="absolute top-1/4 right-1/4"
        animate={{
          y: [0, -50, -100],
          opacity: [0, 0.8, 0],
          scale: [1, 1.2, 1.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeOut"
        }}
      >
        <SteamSVG />
      </motion.div>

      <motion.div
        className="absolute top-1/4 right-1/4 ml-4"
        animate={{
          y: [0, -60, -120],
          opacity: [0, 0.6, 0],
          scale: [1, 1.3, 1.6],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1
        }}
      >
        <SteamSVG />
      </motion.div>

      {/* جزيئات قهوة صغيرة */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-coffee-brown rounded-full"
          style={{
            left: `${10 + i * 10}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* دوائر ديكورية متحركة */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-coffee-brown rounded-full opacity-10"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-coffee-medium rounded-full opacity-5"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}