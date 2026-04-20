import { useState, useEffect } from 'react'
import './App.css'
import SessionResultsTable from './SessionResultsTable'
import SessionResultsChart from './SessionResultsChart'
import ferrariLogo from './assets/ferrari.png'

function App() {
  const [allAccumulatedResults, setAllAccumulatedResults] = useState([])
  const [currentPageResults, setCurrentPageResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextSessionOffset, setNextSessionOffset] = useState(0)
  const [hasMoreSessions, setHasMoreSessions] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2023)
  const [searchQuery, setSearchQuery] = useState('')
  const sessionsPerFetch = 20

  useEffect(() => {
    // Load initial year on component mount
    handleYearChange(selectedYear)
  }, []) // Only on mount, not on selectedYear change

  const handleYearChange = async (year) => {
    console.log(`Year changed to ${year}`)
    setSelectedYear(year)
    setSearchQuery('')
    setAllAccumulatedResults([])
    setCurrentPageResults([])
    setNextSessionOffset(0)
    setHasMoreSessions(true)
    setLoading(true)
    setError(null)

    // Fetch ALL Ferrari results for this year
    await fetchAllResultsForYear(year)
  }

  const handleSearchChange = (query) => {
    console.log(`Search query changed to: ${query}`)
    setSearchQuery(query)

    if (query.trim() === '') {
      // No search, show all results
      setCurrentPageResults(allAccumulatedResults)
    } else {
      // Filter results by driver name (case-insensitive)
      const filtered = allAccumulatedResults.filter(result =>
        result.driver_name.toLowerCase().includes(query.toLowerCase())
      )
      console.log(`Filtered results: ${filtered.length} matches`)
      setCurrentPageResults(filtered)
    }
  }

  const fetchAllResultsForYear = async (year) => {
    try {
      setLoading(true)
      setError(null)

      // STEP 1: Fetch ALL sessions for the selected year
      const sessionsUrl = `http://localhost:3001/api/openf1/sessions?year=${year}`
      console.log(`=== STARTING FETCH FOR YEAR ${year} ===`)
      console.log(`Fetching ALL sessions for year ${year}...`)

      const sessionsResponse = await fetch(sessionsUrl)
      if (!sessionsResponse.ok) throw new Error('Failed to fetch sessions')

      const allSessionsData = await sessionsResponse.json()
      console.log(`✓ Got ${allSessionsData.length} total sessions for year ${year}`)

      if (!allSessionsData || allSessionsData.length === 0) {
        setError('No sessions found for this year')
        setLoading(false)
        return
      }

      const allResults = []
      let sessionsWithFerrari = 0
      let sessionsProcessed = 0
      let driversFetched = 0
      let driversFailed = 0
      let resultsFetched = 0
      let resultsFailed = 0

      // Process each session
      for (const session of allSessionsData) {
        sessionsProcessed++

        try {
          if (!session.session_key || !session.meeting_key) {
            console.warn(`Session ${sessionsProcessed}: Missing session_key or meeting_key`)
            continue
          }

          // STEP 2: Fetch Ferrari drivers for this session
          const driversUrl = `http://localhost:3001/api/openf1/drivers?session_key=${session.session_key}&meeting_key=${session.meeting_key}&team_name=Ferrari`

          let driversResponse
          try {
            driversResponse = await fetch(driversUrl)
          } catch (fetchErr) {
            console.error(`Session ${sessionsProcessed}: Network error fetching drivers:`, fetchErr.message)
            driversFailed++
            continue
          }

          if (!driversResponse.ok) {
            console.log(`Session ${sessionsProcessed} (${session.session_key}): Drivers API returned ${driversResponse.status}`)
            driversFailed++
            continue
          }

          let drivers
          try {
            drivers = await driversResponse.json()
            driversFetched++
          } catch (parseErr) {
            console.error(`Session ${sessionsProcessed}: Error parsing drivers JSON:`, parseErr.message)
            driversFailed++
            continue
          }

          // If no Ferrari drivers, skip this session
          if (!drivers || drivers.length === 0) {
            continue
          }

          sessionsWithFerrari++
          console.log(`Session ${sessionsProcessed} (${session.session_key}): Found ${drivers.length} Ferrari driver(s)`)

          // STEP 3: Fetch session result for each driver
          for (const driver of drivers) {
            if (!driver.driver_number || !driver.full_name) {
              console.warn(`Session ${sessionsProcessed}: Driver missing driver_number or full_name`)
              continue
            }

            try {
              const resultUrl = `http://localhost:3001/api/openf1/session-result?session_key=${session.session_key}&meeting_key=${session.meeting_key}&driver_number=${driver.driver_number}`

              let resultResponse
              try {
                resultResponse = await fetch(resultUrl)
              } catch (fetchErr) {
                console.error(`  → Driver ${driver.full_name}: Network error:`, fetchErr.message)
                resultsFailed++
                continue
              }

              if (!resultResponse.ok) {
                console.log(`  → Driver ${driver.full_name} (${driver.driver_number}): Result API returned ${resultResponse.status}`)
                resultsFailed++
                continue
              }

              let result
              try {
                result = await resultResponse.json()
                resultsFetched++
              } catch (parseErr) {
                console.error(`  → Driver ${driver.full_name}: Error parsing result JSON:`, parseErr.message)
                resultsFailed++
                continue
              }

              if (result && result.length > 0) {
                const resultData = result[0]
                allResults.push({
                  session_type: session.session_type,
                  circuit_short_name: session.circuit_short_name,
                  date_end: session.date_end,
                  number_of_laps: resultData.number_of_laps,
                  final_position: resultData.position,
                  driver_name: driver.full_name,
                  driver_number: driver.driver_number,
                  session_key: session.session_key,
                  meeting_key: session.meeting_key
                })
                console.log(`  ✓ Driver ${driver.full_name}: Position ${resultData.position}, Laps ${resultData.number_of_laps}`)
              }
            } catch (err) {
              console.error(`  ✗ Unexpected error for driver ${driver.driver_number}:`, err.message)
              resultsFailed++
              continue
            }
          }
        } catch (err) {
          console.error(`Session ${sessionsProcessed}: Unexpected error:`, err.message)
          continue
        }
      }

      console.log(`=== FETCH COMPLETE ===`)
      console.log(`Sessions processed: ${sessionsProcessed}`)
      console.log(`Sessions with Ferrari drivers: ${sessionsWithFerrari}`)
      console.log(`Drivers fetch attempts: ${driversFetched} success, ${driversFailed} failed`)
      console.log(`Results fetch attempts: ${resultsFetched} success, ${resultsFailed} failed`)
      console.log(`Total Ferrari results collected: ${allResults.length}`)

      if (allResults.length === 0) {
        setError(`No Ferrari results found for year ${year}`)
      }

      setAllAccumulatedResults(allResults)
      setCurrentPageResults(allResults)
      console.log(`✓ State updated:`)
      console.log(`  allAccumulatedResults.length = ${allResults.length}`)
      console.log(`  currentPageResults.length = ${allResults.length}`)
      console.log(`  First result:`, allResults[0])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-title">
          <img src={ferrariLogo} alt="Ferrari Logo" className="ferrari-logo" />
          <h1>Ferrari Dashboard</h1>
        </div>
        <p>Session Results</p>
        <div className="header-controls">
          <div className="year-selector">
            <label htmlFor="year-select">Year: </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          <div className="search-container">
            <label htmlFor="driver-search">Search Driver: </label>
            <input
              id="driver-search"
              type="text"
              placeholder="Enter driver name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => handleSearchChange('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <strong>⚠️ Error</strong>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading Ferrari session results...</div>
      ) : (
        <>
          <div className="data-container">
            <SessionResultsTable results={currentPageResults} />
          </div>

          <div className="chart-wrapper">
            <SessionResultsChart results={currentPageResults} />
          </div>
        </>
      )}
    </div>
  )
}

export default App
