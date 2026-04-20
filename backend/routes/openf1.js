import express from 'express'

const router = express.Router()

// Fetch sessions with pagination (cached per year)
let sessionsCacheByYear = {} // Cache sessions separately by year
let cacheTimestampByYear = {} // Track cache time per year
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

router.get('/sessions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0
    const year = req.query.year ? parseInt(req.query.year) : null

    const cacheKey = year ? `year_${year}` : 'all_years'

    // Check if cache is still valid
    const now = Date.now()
    if (!sessionsCacheByYear[cacheKey] || !cacheTimestampByYear[cacheKey] || (now - cacheTimestampByYear[cacheKey]) > CACHE_DURATION) {
      console.log(`Fetching fresh sessions data from OpenF1 for ${year ? `year ${year}` : 'all years'}...`)

      let url = 'https://api.openf1.org/v1/sessions'
      if (year) {
        url += `?year=${year}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`OpenF1 API returned ${response.status}`)
      }

      sessionsCacheByYear[cacheKey] = await response.json()
      cacheTimestampByYear[cacheKey] = now
      console.log(`Cached ${sessionsCacheByYear[cacheKey].length} sessions for ${year ? `year ${year}` : 'all years'}`)
    }

    // Paginate the cached results
    const paginatedResults = sessionsCacheByYear[cacheKey].slice(offset, offset + limit)

    res.json(paginatedResults)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions', details: error.message })
  }
})

// Fetch Ferrari drivers for a specific session
router.get('/drivers', async (req, res) => {
  try {
    const { meeting_key, session_key } = req.query

    if (!meeting_key || !session_key) {
      return res.status(400).json({ error: 'meeting_key and session_key required' })
    }

    const response = await fetch(
      `https://api.openf1.org/v1/drivers?session_key=${session_key}&meeting_key=${meeting_key}&team_name=Ferrari`
    )

    if (!response.ok) {
      console.warn(`OpenF1 drivers API returned ${response.status} for meeting_key=${meeting_key}, session_key=${session_key}`)
      return res.json([])
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching drivers:', error)
    res.status(500).json({ error: 'Failed to fetch drivers', details: error.message })
  }
})

// Fetch session results for a specific driver
router.get('/session-result', async (req, res) => {
  try {
    const { session_key, meeting_key, driver_number } = req.query

    if (!session_key || !meeting_key || !driver_number) {
      return res.status(400).json({ error: 'session_key, meeting_key, and driver_number required' })
    }

    const response = await fetch(
      `https://api.openf1.org/v1/session_result?session_key=${session_key}&meeting_key=${meeting_key}&driver_number=${driver_number}`
    )

    if (!response.ok) {
      console.warn(`OpenF1 session_result API returned ${response.status} for driver_number=${driver_number}`)
      return res.json([])
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching session result:', error)
    res.status(500).json({ error: 'Failed to fetch session result', details: error.message })
  }
})

export default router
