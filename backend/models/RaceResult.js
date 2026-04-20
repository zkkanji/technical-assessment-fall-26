import mongoose from 'mongoose'

const raceResultSchema = new mongoose.Schema({
  race: {
    type: String,
    required: true
  },
  raceDate: {
    type: Date,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  driver: {
    driverId: String,
    givenName: String,
    familyName: String
  },
  totalTime: String,
  points: String,
  fastestLap: Boolean,
  status: String,
  season: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('RaceResult', raceResultSchema)
