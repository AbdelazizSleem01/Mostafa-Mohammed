'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaCoffee, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/admin/dashboard')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen  flex items-center justify-center bg-linear-to-br from-coffee-light via-amber-50 to-coffee-light p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-white shadow-2xl w-full max-w-md"
      >
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-coffee-brown rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FaCoffee className="text-white text-2xl" />
            </motion.div>
            <h2 className="card-title justify-center text-2xl text-coffee-dark mb-2">
              Admin Login
            </h2>
            <p className="text-coffee-medium">
              Access your portfolio dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="alert alert-error"
              >
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-coffee-dark">Email</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 text-coffee-medium" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full pl-10 bg-coffee-light border-coffee-medium text-coffee-dark"
                  placeholder="admin@barista.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-coffee-dark">Password</span>
              </label>
              <div className="relative">
                <FaLock className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 text-coffee-medium" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pl-10 pr-10 bg-coffee-light border-coffee-medium text-coffee-dark"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-medium hover:text-coffee-dark"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="loading loading-spinner loading-sm"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>


        </div>
      </motion.div>
    </div>
  )
}