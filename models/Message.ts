import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  reply: {
    type: String,
    trim: true
  },
  repliedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for faster queries
MessageSchema.index({ status: 1, createdAt: -1 })
MessageSchema.index({ email: 1 })

export default mongoose.models.Message || mongoose.model('Message', MessageSchema)
