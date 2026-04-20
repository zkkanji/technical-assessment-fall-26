import express from 'express'
import RaceResult from '../models/RaceResult.js'

const router = express.Router()

// Fetch sessions with pagination (cached per year)
let sessionsCacheByYear = {} // Cache sessions separately by year
let cacheTimestampByYear = {} // Track cache time per year
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

router.get('/sessions', async (req, res) => {
  try {
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

    // Return ALL cached sessions for the year (no pagination on backend)
    res.json(sessionsCacheByYear[cacheKey])
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

    console.log(`[DRIVERS] Fetching drivers for session_key=${session_key}, meeting_key=${meeting_key}`)

    // Fetch ALL drivers for this session (no team filter)
    const response = await fetch(
      `https://api.openf1.org/v1/drivers?session_key=${session_key}&meeting_key=${meeting_key}`
    )

    if (!response.ok) {
      console.warn(`[DRIVERS] OpenF1 drivers API returned ${response.status}`)
      return res.json([])
    }

    const allDrivers = await response.json()
    console.log(`[DRIVERS] OpenF1 returned ${allDrivers.length} total drivers`)

    if (allDrivers.length > 0) {
      console.log(`[DRIVERS] First driver object:`, JSON.stringify(allDrivers[0], null, 2))
    }

    // Filter for Ferrari team on the backend
    const ferrariDrivers = allDrivers.filter(driver => {
      const teamName = driver.team_name ? driver.team_name.toLowerCase() : ''
      const isFerrari = teamName === 'ferrari'
      console.log(`[DRIVERS] Driver: ${driver.full_name || 'Unknown'}, Team: ${driver.team_name || 'null'}, IsFerrari: ${isFerrari}`)
      return isFerrari
    })

    console.log(`[DRIVERS] Filtered to ${ferrariDrivers.length} Ferrari drivers`)

    res.json(ferrariDrivers)
  } catch (error) {
    console.error('[DRIVERS] Error fetching drivers:', error)
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

// Get all Ferrari results for a year (from MongoDB cache or OpenF1)
router.get('/ferrari-year/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year)

    // Check if we have cached results in MongoDB
    const cachedResults = await RaceResult.find({ year })
    if (cachedResults && cachedResults.length > 0) {
      console.log(`[FERRARI YEAR] Found ${cachedResults.length} cached results for year ${year}`)
      return res.json(cachedResults)
    }

    console.log(`[FERRARI YEAR] No cached results for ${year}, fetching from OpenF1...`)

    // Fetch all sessions for the year
    const sessionsUrl = `https://api.openf1.org/v1/sessions?year=${year}`
    const sessionsResponse = await fetch(sessionsUrl)
    if (!sessionsResponse.ok) throw new Error('Failed to fetch sessions from OpenF1')

    const allSessions = await sessionsResponse.json()
    console.log(`[FERRARI YEAR] Got ${allSessions.length} sessions for year ${year}`)

    const allResults = []
    let sessionsProcessed = 0
    let sessionsWithFerrari = 0

    // Process each session
    for (const session of allSessions) {
      sessionsProcessed++

      try {
        if (!session.session_key || !session.meeting_key) continue

        // Fetch all drivers for this session
        const driversUrl = `https://api.openf1.org/v1/drivers?session_key=${session.session_key}&meeting_key=${session.meeting_key}`
        const driversResponse = await fetch(driversUrl)
        if (!driversResponse.ok) continue

        const allDrivers = await driversResponse.json()

        // Filter for Ferrari
        const ferrariDrivers = allDrivers.filter(driver =>
          driver.team_name && driver.team_name.toLowerCase() === 'ferrari'
        )

        if (ferrariDrivers.length === 0) continue

        sessionsWithFerrari++
        console.log(`[FERRARI YEAR] Session ${sessionsProcessed}: Found ${ferrariDrivers.length} Ferrari driver(s)`)

        // Fetch result for each Ferrari driver
        for (const driver of ferrariDrivers) {
          try {
            const resultUrl = `https://api.openf1.org/v1/session_result?session_key=${session.session_key}&meeting_key=${session.meeting_key}&driver_number=${driver.driver_number}`
            const resultResponse = await fetch(resultUrl)
            if (!resultResponse.ok) continue

            const resultArray = await resultResponse.json()
            if (!resultArray || resultArray.length === 0) continue

            const resultData = resultArray[0]

            // Create result object
            const result = {
              session_key: session.session_key,
              meeting_key: session.meeting_key,
              session_type: session.session_type,
              circuit_short_name: session.circuit_short_name,
              date_end: session.date_end,
              year: year,
              driver_name: driver.full_name,
              driver_number: driver.driver_number,
              number_of_laps: resultData.number_of_laps,
              final_position: resultData.position
            }

            allResults.push(result)
            console.log(`[FERRARI YEAR]   ✓ ${driver.full_name}: Position ${resultData.position}`)

            // Save to MongoDB
            try {
              await RaceResult.create(result)
            } catch (saveErr) {
              console.warn(`[FERRARI YEAR] Warning saving to DB: ${saveErr.message}`)
            }
          } catch (err) {
            console.error(`[FERRARI YEAR] Error processing driver:`, err.message)
          }
        }
      } catch (err) {
        console.error(`[FERRARI YEAR] Error processing session:`, err.message)
      }
    }

    console.log(`[FERRARI YEAR] Complete: ${sessionsProcessed} sessions, ${sessionsWithFerrari} with Ferrari, ${allResults.length} total results`)
    res.json(allResults)
  } catch (error) {
    console.error('[FERRARI YEAR] Error:', error)
    res.status(500).json({ error: 'Failed to fetch Ferrari results', details: error.message })
  }
})
router.get('/ferrari-results/year/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year)

    const results = await RaceResult.find({ year })
      .sort({ date_end: 1 })

    console.log(`[FERRARI RESULTS] Retrieved ${results.length} results for year ${year} from MongoDB`)

    res.json(results)
  } catch (error) {
    console.error('[FERRARI RESULTS] Error fetching results:', error)
    res.status(500).json({ error: 'Failed to fetch Ferrari results', details: error.message })
  }
})

// Save Ferrari result to MongoDB
router.post('/ferrari-results', async (req, res) => {
  try {
    const result = new RaceResult(req.body)
    await result.save()
    console.log(`[SAVE RESULT] Saved Ferrari result: ${result.driver_name}`)
    res.json(result)
  } catch (error) {
    console.error('[SAVE RESULT] Error saving result:', error)
    res.status(500).json({ error: 'Failed to save Ferrari result', details: error.message })
  }
})
