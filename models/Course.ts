import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Course || mongoose.model('Course', CourseSchema)