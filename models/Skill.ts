import mongoose from 'mongoose'

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    required: true,
    default: 'FaCoffee' 
  }
}, {
  timestamps: true
})

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema)