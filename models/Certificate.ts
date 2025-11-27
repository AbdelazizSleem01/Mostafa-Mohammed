import mongoose from 'mongoose'

const CertificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  date: {
    type: Date
  }
}, {
  timestamps: true
})

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema)