import mongoose from 'mongoose'

const AnalyticsSchema = new mongoose.Schema({
  visits: {
    type: Number,
    default: 0
  },
  lastVisit: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema)