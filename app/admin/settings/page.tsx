'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as FaIcons from 'react-icons/fa'

export default function AdminSettings() {
    const { data: session, status, update } = useSession()
    const router = useRouter()

    const [formData, setFormData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user?.email) {
            setFormData(prev => ({ ...prev, email: session.user.email }))
        }
    }, [status, session, router])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (notification) setNotification(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setNotification(null)

        // Validation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setNotification({ type: 'error', message: 'New passwords do not match' })
            setLoading(false)
            return
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            setNotification({ type: 'error', message: 'New password must be at least 6 characters long' })
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword || undefined
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setNotification({ type: 'success', message: 'Profile updated successfully!' })

            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }))

            if (formData.email !== session?.user?.email) {
                await update({ email: formData.email })
            }

        } catch (error: any) {
            setNotification({ type: 'error', message: error.message })
        } finally {
            setLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-coffee-light to-amber-50">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
                    <p className="text-coffee-dark text-lg">Loading Settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-coffee-light to-amber-50 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-coffee-dark mb-2">
                            Admin Settings
                        </h1>
                        <p className="text-coffee-medium text-lg">
                            Manage your account settings and security preferences
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

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* User Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl"
                    >
                        <div className="card-body p-6 lg:p-8">
                            <div className="text-center mb-6">
                                <div className="avatar placeholder mb-4">
                                    <div className="bg-coffee-brown text-white rounded-full w-20 h-20 text-2xl font-bold flex items-center justify-center">
                                        <span>{session?.user?.name?.charAt(0) || 'A'}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-coffee-dark mb-2">
                                    {session?.user?.name || 'Admin User'}
                                </h3>
                                <p className="text-coffee-medium text-sm">
                                    {session?.user?.email}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-coffee-light/30 rounded-xl">
                                    <FaIcons.FaShieldAlt className="text-coffee-brown text-lg" />
                                    <div>
                                        <p className="font-semibold text-coffee-dark">Admin Access</p>
                                        <p className="text-coffee-medium text-sm">Full system permissions</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-coffee-light/30 rounded-xl">
                                    <FaIcons.FaCalendarAlt className="text-coffee-brown text-lg" />
                                    <div>
                                        <p className="font-semibold text-coffee-dark">Last Login</p>
                                        <p className="text-coffee-medium text-sm">Recently active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl lg:col-span-2"
                    >
                        <div className="card-body p-6 lg:p-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-coffee-dark mb-2 flex items-center gap-3">
                                <FaIcons.FaUserCog className="text-coffee-brown" />
                                Account Settings
                            </h2>
                            <p className="text-coffee-medium mb-6">
                                Update your email address and manage password security
                            </p>

                            {/* Notification */}
                            <AnimatePresence>
                                {notification && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`alert backdrop-blur-sm border-2 ${notification.type === 'success'
                                                ? 'bg-green-500/20 border-green-400/30 text-green-800'
                                                : 'bg-red-500/20 border-red-400/30 text-red-800'
                                            } mb-6`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {notification.type === 'success' ? (
                                                <FaIcons.FaCheckCircle className="text-xl text-green-600" />
                                            ) : (
                                                <FaIcons.FaExclamationTriangle className="text-xl text-red-600" />
                                            )}
                                            <span className="font-semibold">{notification.message}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-coffee-dark mb-4 flex items-center gap-2">
                                        <FaIcons.FaEnvelope className="text-coffee-brown" />
                                        Email Address
                                    </h3>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-coffee-dark font-semibold">Email Address *</span>
                                        </label>
                                        <div className="relative">
                                            <FaIcons.FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-medium z-10" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                className="input input-bordered w-full pl-12 bg-white/50 backdrop-blur-sm border-coffee-light rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-coffee-dark mb-4 flex items-center gap-2">
                                        <FaIcons.FaLock className="text-coffee-brown" />
                                        Security Settings
                                    </h3>

                                    {/* Current Password */}
                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text text-coffee-dark font-semibold">Current Password *</span>
                                        </label>
                                        <div className="relative">
                                            <FaIcons.FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-medium z-10" />
                                            <input
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={(e) => handleChange('currentPassword', e.target.value)}
                                                className="input input-bordered w-full pl-12 bg-white/50 backdrop-blur-sm border-coffee-light rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20"
                                                placeholder="Enter your current password"
                                                required
                                            />
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt text-coffee-light">
                                                Required to save any changes
                                            </span>
                                        </label>
                                    </div>

                                    {/* New Password */}
                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text text-coffee-dark font-semibold">New Password</span>
                                        </label>
                                        <div className="relative">
                                            <FaIcons.FaKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-medium z-10" />
                                            <input
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={(e) => handleChange('newPassword', e.target.value)}
                                                className="input input-bordered w-full pl-12 bg-white/50 backdrop-blur-sm border-coffee-light rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20"
                                                placeholder="Leave blank to keep current password"
                                                minLength={6}
                                            />
                                        </div>
                                        <label className="label">
                                            <span className="label-text-alt text-coffee-light">
                                                Minimum 6 characters
                                            </span>
                                        </label>
                                    </div>

                                    {/* Confirm New Password */}
                                    {formData.newPassword && (
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-coffee-dark font-semibold">Confirm New Password *</span>
                                            </label>
                                            <div className="relative">
                                                <FaIcons.FaCheckCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-medium z-10" />
                                                <input
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                                    className="input input-bordered w-full pl-12 bg-white/50 backdrop-blur-sm border-coffee-light rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20"
                                                    placeholder="Confirm your new password"
                                                    required={!!formData.newPassword}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.newPassword && (
                                    <div className="bg-coffee-light/30 p-4 rounded-xl border border-coffee-light">
                                        <h4 className="font-semibold text-coffee-dark mb-2">Password Strength</h4>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${formData.newPassword.length >= 8 ? 'bg-green-500' :
                                                        formData.newPassword.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${Math.min((formData.newPassword.length / 12) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-coffee-medium">
                                            {formData.newPassword.length >= 8 ? 'Strong password' :
                                                formData.newPassword.length >= 6 ? 'Medium strength' : 'Weak password'}
                                        </p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="btn w-full bg-coffee-brown hover:bg-coffee-dark border-none text-white text-lg py-4 rounded-xl disabled:bg-coffee-medium transition-all duration-300"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="loading loading-spinner loading-sm"></div>
                                            Saving Changes...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <FaIcons.FaSave />
                                            Save Changes
                                        </div>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Additional Security Info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl mt-8"
                >
                    <div className="card-body p-6 lg:p-8">
                        <h3 className="text-xl font-bold text-coffee-dark mb-4 flex items-center gap-3">
                            <FaIcons.FaShieldAlt className="text-coffee-brown" />
                            Security Recommendations
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <FaIcons.FaCheckCircle className="text-green-500 text-lg mt-1 shrink-0" />
                                <div>
                                    <p className="font-semibold text-coffee-dark">Use a strong password</p>
                                    <p className="text-coffee-medium text-sm">Include uppercase, lowercase, numbers, and symbols</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FaIcons.FaCheckCircle className="text-green-500 text-lg mt-1 shrink-0" />
                                <div>
                                    <p className="font-semibold text-coffee-dark">Update regularly</p>
                                    <p className="text-coffee-medium text-sm">Change your password every 3-6 months</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FaIcons.FaCheckCircle className="text-green-500 text-lg mt-1 shrink-0" />
                                <div>
                                    <p className="font-semibold text-coffee-dark">Keep it unique</p>
                                    <p className="text-coffee-medium text-sm">Don't reuse passwords across different services</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FaIcons.FaCheckCircle className="text-green-500 text-lg mt-1 shrink-0" />
                                <div>
                                    <p className="font-semibold text-coffee-dark">Secure connection</p>
                                    <p className="text-coffee-medium text-sm">Always use HTTPS and secure networks</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}