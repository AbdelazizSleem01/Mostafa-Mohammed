import mongoose from 'mongoose'

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  embedType: {
    type: String,
    enum: ['embed', 'link'],
    default: 'embed'
  }
}, {
  timestamps: true
})

export default mongoose.models.Video || mongoose.model('Video', VideoSchema)