import mongoose from 'mongoose'

const CareerSchema = new mongoose.Schema({
  workplace: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export default mongoose.models.Career || mongoose.model('Career', CareerSchema)