import { useState, useEffect } from 'react'
import './App.css'
import SessionResultsTable from './SessionResultsTable'
import SessionResultsChart from './SessionResultsChart'
import PaginationButton from './PaginationButton'
import ferrariLogo from './assets/ferrari.png'

function App() {
  const [allAccumulatedResults, setAllAccumulatedResults] = useState([])
  const [currentPageResults, setCurrentPageResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [nextSessionOffset, setNextSessionOffset] = useState(0)
  const [hasMoreSessions, setHasMoreSessions] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedYear, setSelectedYear] = useState(2023)
  const [searchQuery, setSearchQuery] = useState('')
  const resultsPerPage = 20
  const sessionsPerFetch = 20

  useEffect(() => {
    handlePageChange(currentPage)
  }, [currentPage])

  useEffect(() => {
    console.log(`Year changed, resetting and loading data for year ${selectedYear}`)
    handlePageChange(0)
  }, [selectedYear])

  const handleYearChange = (year) => {
    console.log(`Year changed to ${year}`)
    setSelectedYear(year)
    setSearchQuery('')
    setAllAccumulatedResults([])
    setCurrentPageResults([])
    setNextSessionOffset(0)
    setHasMoreSessions(true)
    setTotalPages(0)
  }

  const handleSearchChange = (query) => {
    console.log(`Search query changed to: ${query}`)
    setSearchQuery(query)
    setCurrentPage(0)

    if (query.trim() === '') {
      // No search, show all results
      const pages = Math.ceil(allAccumulatedResults.length / resultsPerPage)
      setTotalPages(pages)
      setCurrentPageResults(allAccumulatedResults.slice(0, resultsPerPage))
    } else {
      // Filter results by driver name (case-insensitive)
      const filtered = allAccumulatedResults.filter(result =>
        result.driver_name.toLowerCase().includes(query.toLowerCase())
      )
      console.log(`Filtered results: ${filtered.length} matches`)

      const pages = Math.ceil(filtered.length / resultsPerPage)
      setTotalPages(pages)
      setCurrentPageResults(filtered.slice(0, resultsPerPage))
    }
  }

  const getDisplayResults = () => {
    if (searchQuery.trim() === '') {
      return allAccumulatedResults
    }
    return allAccumulatedResults.filter(result =>
      result.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handlePageChange = async (page) => {
    console.log(`handlePageChange called with page ${page}`)
    console.log(`Current state: allAccumulatedResults.length=${allAccumulatedResults.length}, totalPages=${totalPages}, hasMoreSessions=${hasMoreSessions}`)

    const displayResults = getDisplayResults()
    const startIdx = page * resultsPerPage
    const endIdx = startIdx + resultsPerPage
    console.log(`Need results from ${startIdx} to ${endIdx}`)

    // If we already have enough filtered results for this page, just display them
    if (endIdx <= displayResults.length) {
      console.log(`Results already available, displaying from index ${startIdx} to ${endIdx}`)
      setCurrentPageResults(displayResults.slice(startIdx, endIdx))
      setLoading(false)
      return
    }

    console.log(`Need to fetch more results (have ${displayResults.length}, need ${endIdx})`)
    // Otherwise, fetch more sessions until we have enough results
    await fetchUntilEnoughResults(allAccumulatedResults, startIdx, endIdx)
  }

  const fetchUntilEnoughResults = async (existingResults, startIdx, endIdx) => {
    try {
      setLoading(true)
      setError(null)
      let accumulated = [...existingResults]
      let currentOffset = nextSessionOffset
      let stillHasMore = hasMoreSessions

      console.log(`Fetching until we have ${endIdx} results (currently ${accumulated.length})`)

      // Keep fetching sessions until we have enough results for this page
      while (accumulated.length < endIdx && stillHasMore) {
        const fetchResult = await fetchMoreSessions(currentOffset)
        const { results: newResults, hasMoreSessions: moreAvailable } = fetchResult

        stillHasMore = moreAvailable
        console.log(`Has more sessions available: ${stillHasMore}`)

        if (newResults.length === 0 && !stillHasMore) {
          console.log('No more results and no more sessions')
          break
        }

        accumulated = [...accumulated, ...newResults]
        currentOffset += sessionsPerFetch
        console.log(`Accumulated ${accumulated.length} results so far`)
      }

      // Update state
      setNextSessionOffset(currentOffset)
      setHasMoreSessions(stillHasMore)

      setAllAccumulatedResults(accumulated)
      setCurrentPageResults(accumulated.slice(startIdx, endIdx))
      const pages = Math.ceil(accumulated.length / resultsPerPage)
      setTotalPages(pages)
      console.log(`Set total pages to ${pages}, hasMoreSessions: ${stillHasMore}`)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMoreSessions = async (offset) => {
    try {
      // STEP 1: Fetch ALL sessions for the selected year from backend (cached)
      const sessionsUrl = `http://localhost:3001/api/openf1/sessions?year=${selectedYear}`
      console.log(`Fetching ALL sessions for year ${selectedYear} from backend...`)

      const sessionsResponse = await fetch(sessionsUrl)
      if (!sessionsResponse.ok) throw new Error('Failed to fetch sessions')

      const allSessionsData = await sessionsResponse.json()
      console.log(`Got ${allSessionsData.length} TOTAL sessions for year ${selectedYear}`)

      // Apply offset and limit for pagination on the sessions (client-side pagination)
      const paginatedSessions = allSessionsData.slice(offset, offset + sessionsPerFetch)
      console.log(`Processing batch: offset ${offset}, got ${paginatedSessions.length} sessions from the full list`)

      const allResults = []

      // Process each session
      for (const session of paginatedSessions) {
        try {
          // STEP 2: Fetch Ferrari drivers for this session from backend
          const driversUrl = `http://localhost:3001/api/openf1/drivers?session_key=${session.session_key}&meeting_key=${session.meeting_key}&team_name=Ferrari`
          console.log(`Fetching drivers for session ${session.session_key}...`)

          const driversResponse = await fetch(driversUrl)
          if (!driversResponse.ok) {
            console.warn(`No drivers response for session ${session.session_key}`)
            continue
          }

          const drivers = await driversResponse.json()
          console.log(`Session ${session.session_key}: ${drivers.length} Ferrari drivers`)

          // If no Ferrari drivers, skip this session
          if (drivers.length === 0) {
            console.log(`No Ferrari drivers for session ${session.session_key}, skipping...`)
            continue
          }

          // STEP 3: Fetch session result for each driver from backend
          for (const driver of drivers) {
            try {
              const resultUrl = `http://localhost:3001/api/openf1/session-result?session_key=${session.session_key}&meeting_key=${session.meeting_key}&driver_number=${driver.driver_number}`
              console.log(`Fetching result for driver ${driver.full_name}...`)

              const resultResponse = await fetch(resultUrl)
              if (!resultResponse.ok) {
                console.warn(`No result found for driver ${driver.driver_number}`)
                continue
              }

              const result = await resultResponse.json()

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
                console.log(`Added result for ${driver.full_name}: Position ${resultData.position}`)
              }
            } catch (err) {
              console.error(`Error fetching result for driver ${driver.driver_number}:`, err)
              continue
            }
          }
        } catch (err) {
          console.error(`Error processing session ${session.session_key}:`, err)
          continue
        }
      }

      console.log(`Fetched ${allResults.length} results from batch at offset ${offset}`)
      console.log(`Total sessions in year: ${allSessionsData.length} | Current batch had: ${paginatedSessions.length} sessions`)

      // Check if there are more sessions: if we got a full batch, there might be more
      const hasMore = offset + sessionsPerFetch < allSessionsData.length

      console.log(`Has more sessions: ${hasMore} (offset: ${offset}, total: ${allSessionsData.length}, batch size: ${sessionsPerFetch})`)

      return {
        results: allResults,
        hasMoreSessions: hasMore
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      throw err
    }
  }

  const handleNextPage = async () => {
    console.log(`Next button clicked. Current page: ${currentPage}, Total pages: ${totalPages}`)

    // Move to next page
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)

    // Proactively fetch the next batch of sessions if available
    if (hasMoreSessions) {
      console.log(`Proactively fetching next batch at offset ${nextSessionOffset}...`)
      try {
        setLoading(true)
        const fetchResult = await fetchMoreSessions(nextSessionOffset)
        const { results: newResults, hasMoreSessions: moreAvailable } = fetchResult

        // Update state with newly fetched results
        setAllAccumulatedResults(prev => [...prev, ...newResults])
        setNextSessionOffset(prev => prev + sessionsPerFetch)
        setHasMoreSessions(moreAvailable)

        console.log(`Proactively fetched ${newResults.length} new results. Total now: ${allAccumulatedResults.length + newResults.length}`)
      } catch (err) {
        console.error('Error proactively fetching next batch:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePreviousPage = () => {
    console.log(`Previous button clicked. Current page: ${currentPage}`)
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleFirstPage = () => {
    console.log('First button clicked')
    setCurrentPage(0)
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
            <SessionResultsChart results={allAccumulatedResults} />
          </div>

          <div className="pagination-controls">
            <PaginationButton
              onClick={handleFirstPage}
              disabled={currentPage === 0}
            >
              ⏮ First
            </PaginationButton>
            <PaginationButton
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
            >
              ← Previous
            </PaginationButton>
            <span className="pagination-info">
              Page {currentPage + 1} {totalPages > 0 ? `of ${totalPages}` : ''}
            </span>
            <PaginationButton
              onClick={handleNextPage}
              disabled={currentPage > 0 && currentPageResults.length < resultsPerPage && !hasMoreSessions}
            >
              Next →
            </PaginationButton>
          </div>
        </>
      )}
    </div>
  )
}

export default App
