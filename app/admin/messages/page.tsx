'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as FaIcons from 'react-icons/fa'

interface Message {
    _id: string
    name: string
    email: string
    message: string
    status: 'new' | 'read' | 'replied'
    reply?: string
    repliedAt?: string
    createdAt: string
    updatedAt: string
}

export default function MessagesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [replyText, setReplyText] = useState('')
    const [sendingReply, setSendingReply] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchMessages()
        }
    }, [status, router])

    useEffect(() => {
        filterMessages()
    }, [messages, filterStatus, searchQuery])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/messages')
            if (response.ok) {
                const data = await response.json()
                const sortedData = data.sort((a: Message, b: Message) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                setMessages(sortedData)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
            showNotification('error', 'Failed to fetch messages')
        } finally {
            setLoading(false)
        }
    }

    const filterMessages = () => {
        let filtered = messages

        if (filterStatus !== 'all') {
            filtered = filtered.filter(msg => msg.status === filterStatus)
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(msg =>
                msg.name.toLowerCase().includes(query) ||
                msg.email.toLowerCase().includes(query) ||
                msg.message.toLowerCase().includes(query)
            )
        }

        setFilteredMessages(filtered)
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const handleMarkAsRead = async (messageId: string) => {
        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markAsRead' })
            })

            if (response.ok) {
                await fetchMessages()
                const updatedMessage = messages.find(m => m._id === messageId)
                if (updatedMessage) {
                    setSelectedMessage({ ...updatedMessage, status: 'read' })
                }
                showNotification('success', 'Message marked as read')
            }
        } catch (error) {
            console.error('Error marking as read:', error)
            showNotification('error', 'Failed to mark as read')
        }
    }

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return

        try {
            setSendingReply(true)
            const response = await fetch(`/api/messages/${selectedMessage._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reply',
                    reply: replyText
                })
            })

            if (response.ok) {
                await fetchMessages()
                setReplyText('')
                setSelectedMessage(null)
                showNotification('success', 'Reply sent successfully!')
            } else {
                showNotification('error', 'Failed to send reply')
            }
        } catch (error) {
            console.error('Error sending reply:', error)
            showNotification('error', 'Failed to send reply')
        } finally {
            setSendingReply(false)
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return

        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchMessages()
                setSelectedMessage(null)
                showNotification('success', 'Message deleted successfully')
            }
        } catch (error) {
            console.error('Error deleting message:', error)
            showNotification('error', 'Failed to delete message')
        }
    }

    const getStatusBadge = (status: string) => {
        const badges = {
            new: { 
                color: 'bg-blue-100 text-blue-800 border-blue-200', 
                icon: FaIcons.FaEnvelope, 
                text: 'New' 
            },
            read: { 
                color: 'bg-cyan-100 text-cyan-800 border-cyan-200', 
                icon: FaIcons.FaEnvelopeOpen, 
                text: 'Read' 
            },
            replied: { 
                color: 'bg-green-100 text-green-800 border-green-200', 
                icon: FaIcons.FaCheckCircle, 
                text: 'Replied' 
            }
        }
        const badge = badges[status as keyof typeof badges]
        const Icon = badge.icon
        return (
            <span className={`badge border ${badge.color} gap-2 font-semibold`}>
                <Icon className="text-sm" /> {badge.text}
            </span>
        )
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-coffee-light to-amber-50">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-coffee-brown mb-4"></div>
                    <p className="text-coffee-dark text-lg">Loading Messages...</p>
                </div>
            </div>
        )
    }

    const stats = {
        total: messages.length,
        new: messages.filter(m => m.status === 'new').length,
        read: messages.filter(m => m.status === 'read').length,
        replied: messages.filter(m => m.status === 'replied').length
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
                            Contact Messages
                        </h1>
                        <p className="text-coffee-medium text-lg">
                            Manage and respond to messages from your visitors
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

                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-6 right-6 z-50 max-w-sm"
                        >
                            <div className={`alert backdrop-blur-sm border-2 ${
                                notification.type === 'success' 
                                    ? 'bg-green-500/40 border-green-400/50 text-green-100' 
                                    : 'bg-red-500/40 border-red-400/50 text-red-100'
                            } shadow-lg`}>
                                <div className="flex items-center gap-3">
                                    {notification.type === 'success' ? (
                                        <FaIcons.FaCheckCircle className="text-xl text-green-400" />
                                    ) : (
                                        <FaIcons.FaExclamationTriangle className="text-xl text-red-400" />
                                    )}
                                    <span className="font-semibold">{notification.message}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {/* Total Messages */}
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl"
                    >
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-coffee-medium text-sm font-semibold">Total Messages</p>
                                    <p className="text-3xl font-bold text-coffee-dark">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-coffee-brown rounded-xl flex items-center justify-center">
                                    <FaIcons.FaEnvelope className="text-white text-xl" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* New Messages */}
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="card bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-coffee rounded-2xl"
                    >
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-semibold">New Messages</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <FaIcons.FaEnvelope className="text-white text-xl" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Read Messages */}
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="card bg-white/80 backdrop-blur-sm border-2 border-cyan-200 shadow-coffee rounded-2xl"
                    >
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-600 text-sm font-semibold">Read Messages</p>
                                    <p className="text-3xl font-bold text-cyan-600">{stats.read}</p>
                                </div>
                                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                                    <FaIcons.FaEnvelopeOpen className="text-white text-xl" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Replied Messages */}
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="card bg-white/80 backdrop-blur-sm border-2 border-green-200 shadow-coffee rounded-2xl"
                    >
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-semibold">Replied</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.replied}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                    <FaIcons.FaCheckCircle className="text-white text-xl" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl mb-8"
                >
                    <div className="card-body p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Search */}
                            <div className="flex-1">
                                <label className="block text-coffee-dark font-semibold mb-3">Search Messages</label>
                                <div className="relative">
                                    <FaIcons.FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-medium z-10" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or message content..."
                                        className="input input-bordered w-full pl-12 bg-white/50 backdrop-blur-sm border-coffee-medium rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-medium hover:text-coffee-dark"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <FaIcons.FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="flex flex-col">
                                <label className="block text-coffee-dark font-semibold mb-3">Filter by Status</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { key: 'all', label: 'All', color: 'bg-coffee-light text-coffee-dark' },
                                        { key: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
                                        { key: 'read', label: 'Read', color: 'bg-cyan-100 text-cyan-800' },
                                        { key: 'replied', label: 'Replied', color: 'bg-green-100 text-green-800' }
                                    ].map((filter) => (
                                        <motion.button
                                            key={filter.key}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`btn btn-sm border-0 bg-coffee-light ${filter.key === filterStatus ? filter.color : ' text-coffee-dark '} rounded-lg`}
                                            onClick={() => setFilterStatus(filter.key)}
                                        >
                                            {filter.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Messages List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {filteredMessages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee rounded-2xl"
                        >
                            <div className="card-body text-center py-16">
                                <FaIcons.FaEnvelope className="text-6xl text-coffee-light mx-auto mb-4" />
                                <h3 className="text-2xl text-coffee-dark mb-2">No messages found</h3>
                                <p className="text-coffee-medium">
                                    {searchQuery || filterStatus !== 'all' 
                                        ? 'Try adjusting your search or filter criteria' 
                                        : 'No contact messages received yet'
                                    }
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        filteredMessages.map((message, index) => (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -2, scale: 1.01 }}
                                className="card bg-white/80 backdrop-blur-sm border-2 border-coffee-light shadow-coffee hover:shadow-coffee-lg rounded-2xl cursor-pointer transition-all duration-300"
                                onClick={() => setSelectedMessage(message)}
                            >
                                <div className="card-body p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4 mb-3">
                                                <div className="w-12 h-12 bg-coffee-brown rounded-xl flex items-center justify-center shrink-0">
                                                    <FaIcons.FaUser className="text-white text-lg" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
                                                        <h3 className="font-bold text-coffee-dark text-lg truncate">
                                                            {message.name}
                                                        </h3>
                                                        {getStatusBadge(message.status)}
                                                    </div>
                                                    <p className="text-coffee-dark font-semibold text-sm mb-1">
                                                        {message.email}
                                                    </p>
                                                    <p className="text-coffee-brown line-clamp-2 mb-3">
                                                        {message.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-coffee-medium">
                                                        <span className="flex items-center gap-1">
                                                            <FaIcons.FaClock />
                                                            {formatDate(message.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Quick Actions */}
                                        <div className="flex gap-2 shrink-0">
                                            {message.status === 'new' && (
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="btn btn-sm bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleMarkAsRead(message._id)
                                                    }}
                                                    title="Mark as read"
                                                >
                                                    <FaIcons.FaEnvelopeOpen />
                                                </motion.button>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="btn btn-sm bg-red-100 border-red-200 text-red-800 hover:bg-red-200"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteMessage(message._id)
                                                }}
                                                title="Delete message"
                                            >
                                                <FaIcons.FaTrash />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedMessage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="card bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="card-body p-0">
                                {/* Header */}
                                <div className="bg-linear-to-r from-coffee-brown to-amber-700 p-6 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <FaIcons.FaEnvelope className="text-2xl" />
                                            <h2 className="text-2xl font-bold">Message Details</h2>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="btn btn-sm btn-circle bg-white/20 border-0 text-white hover:bg-white/30"
                                            onClick={() => setSelectedMessage(null)}
                                        >
                                            <FaIcons.FaTimes />
                                        </motion.button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(selectedMessage.status)}
                                        <span className="text-amber-100">
                                            Received: {formatDate(selectedMessage.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                    {/* Sender Info */}
                                    <div className="flex items-center gap-4 p-4 bg-coffee-light/30 rounded-xl">
                                        <div className="w-16 h-16 bg-coffee-brown rounded-xl flex items-center justify-center shrink-0">
                                            <FaIcons.FaUser className="text-white text-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-coffee-dark text-lg">{selectedMessage.name}</p>
                                            <p className="text-coffee-brown font-semibold">{selectedMessage.email}</p>
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    <div>
                                        <h3 className="font-bold text-coffee-dark mb-3 text-lg">Message Content</h3>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-coffee-light">
                                            <p className="whitespace-pre-wrap text-coffee-dark leading-relaxed">
                                                {selectedMessage.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Previous Reply */}
                                    {selectedMessage.reply && (
                                        <div>
                                            <h3 className="font-bold text-coffee-dark mb-3 text-lg flex items-center gap-2">
                                                <FaIcons.FaCheckCircle className="text-green-500" />
                                                Your Reply
                                            </h3>
                                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl">
                                                <p className="whitespace-pre-wrap text-green-800 leading-relaxed">
                                                    {selectedMessage.reply}
                                                </p>
                                                {selectedMessage.repliedAt && (
                                                    <p className="text-green-600 text-sm mt-3">
                                                        Replied on: {formatDate(selectedMessage.repliedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reply Form */}
                                    {selectedMessage.status !== 'replied' && (
                                        <div>
                                            <h3 className="font-bold text-coffee-dark mb-3 text-lg flex items-center gap-2">
                                                <FaIcons.FaReply className="text-coffee-brown" />
                                                Send Reply
                                            </h3>
                                            <textarea
                                                className="textarea textarea-bordered w-full h-32 bg-white/50 border-coffee-light rounded-xl focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown/20 resize-none"
                                                placeholder="Type your response here..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            ></textarea>
                                            <div className="flex gap-3 justify-end mt-4">
                                                {selectedMessage.status === 'new' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="btn bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"
                                                        onClick={() => handleMarkAsRead(selectedMessage._id)}
                                                    >
                                                        <FaIcons.FaEnvelopeOpen className="mr-2" />
                                                        Mark as Read
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="btn bg-coffee-brown border-coffee-brown hover:bg-coffee-dark text-white"
                                                    onClick={handleSendReply}
                                                    disabled={!replyText.trim() || sendingReply}
                                                >
                                                    {sendingReply ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="loading loading-spinner loading-sm"></div>
                                                            Sending...
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <FaIcons.FaPaperPlane />
                                                            Send Reply
                                                        </div>
                                                    )}
                                                </motion.button>
                                            </div>
                                {/* Footer Actions */}
                                <div className="border-t border-coffee-light mt-6">
                                    <div className="flex justify-between items-center">
                                        <p className="text-coffee-medium text-sm">
                                            Message ID: {selectedMessage._id}
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="btn bg-red-100 border-red-200 text-red-800 hover:bg-red-200"
                                            onClick={() => handleDeleteMessage(selectedMessage._id)}
                                        >
                                            <FaIcons.FaTrash className="mr-2" />
                                            Delete Message
                                        </motion.button>
                                    </div>
                                </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}