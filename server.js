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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas')
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

// Routes
app.use('/api', raceResultsRoutes)
app.use('/api/openf1', openf1Routes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' })
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
