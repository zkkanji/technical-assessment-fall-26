import express from 'express'
import RaceResult from '../models/RaceResult.js'

const router = express.Router()

// Get paginated Ferrari race results (most recent first)
router.get('/ferrari-results', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 20

    const results = await RaceResult.find()
      .sort({ raceDate: -1 })
      .skip(page * limit)
      .limit(limit)

    const total = await RaceResult.countDocuments()

    res.json({
      data: results,
      total,
      page,
      limit,
      hasMore: (page + 1) * limit < total
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    res.status(500).json({ error: 'Failed to fetch race results' })
  }
})

// Get results by season
router.get('/ferrari-results/season/:season', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 20

    const results = await RaceResult.find({ season: parseInt(req.params.season) })
      .sort({ raceDate: -1 })
      .skip(page * limit)
      .limit(limit)

    res.json(results)
  } catch (error) {
    console.error('Error fetching results:', error)
    res.status(500).json({ error: 'Failed to fetch race results' })
  }
})

// Get results by race
router.get('/ferrari-results/race/:race', async (req, res) => {
  try {
    const results = await RaceResult.find({ race: req.params.race })
    res.json(results)
  } catch (error) {
    console.error('Error fetching results:', error)
    res.status(500).json({ error: 'Failed to fetch race results' })
  }
})

// Add a new race result
router.post('/ferrari-results', async (req, res) => {
  try {
    const newResult = new RaceResult(req.body)
    await newResult.save()
    res.status(201).json(newResult)
  } catch (error) {
    console.error('Error adding result:', error)
    res.status(500).json({ error: 'Failed to add race result' })
  }
})

// Update a race result
router.put('/ferrari-results/:id', async (req, res) => {
  try {
    const result = await RaceResult.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(result)
  } catch (error) {
    console.error('Error updating result:', error)
    res.status(500).json({ error: 'Failed to update race result' })
  }
})

// Delete a race result
router.delete('/ferrari-results/:id', async (req, res) => {
  try {
    await RaceResult.findByIdAndDelete(req.params.id)
    res.json({ message: 'Race result deleted' })
  } catch (error) {
    console.error('Error deleting result:', error)
    res.status(500).json({ error: 'Failed to delete race result' })
  }
})

export default router
