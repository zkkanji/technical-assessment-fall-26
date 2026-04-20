import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import raceResultsRoutes from './backend/routes/raceResults.js'
import openf1Routes from './backend/routes/openf1.js'
import RaceResult from './backend/models/RaceResult.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection with retry logic
let mongoConnected = false

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    mongoConnected = true
    console.log('✓ Connected to MongoDB Atlas')
  } catch (err) {
    mongoConnected = false
    console.error('✗ MongoDB connection error:', err.message)
    console.log('⚠ Retrying MongoDB connection in 5 seconds...')
    setTimeout(connectMongoDB, 5000)
  }
}

connectMongoDB()

// Routes
app.use('/api', raceResultsRoutes)
app.use('/api/openf1', openf1Routes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Backend server is running',
    mongoConnected: mongoConnected
  })
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
  console.log(`MongoDB Status: ${mongoConnected ? 'Connected' : 'Connecting...'}`)
})
