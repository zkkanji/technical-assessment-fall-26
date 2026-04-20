import mongoose from 'mongoose'

const raceResultSchema = new mongoose.Schema({
  // OpenF1 session data
  session_key: {
    type: Number,
    required: true
  },
  meeting_key: {
    type: Number,
    required: true
  },
  session_type: {
    type: String,
    required: true
  },
  circuit_short_name: {
    type: String,
    required: true
  },
  date_end: {
    type: Date,
    required: true
  },
  year: {
    type: Number,
    required: true
  },

  // Driver data
  driver_name: {
    type: String,
    required: true
  },
  driver_number: {
    type: Number,
    required: true
  },

  // Result data
  number_of_laps: {
    type: Number,
    required: true
  },
  final_position: {
    type: Number,
    sparse: true
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Index for faster queries
raceResultSchema.index({ year: 1, driver_number: 1 })
raceResultSchema.index({ session_key: 1, meeting_key: 1 })

export default mongoose.model('RaceResult', raceResultSchema)

