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
  const [selectedYear, setSelectedYear] = useState(2023)
  const [searchQuery, setSearchQuery] = useState('')
  const resultsPerPage = 20

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
    setCurrentPage(0)

    if (query.trim() === '') {
      // No search, show first page of all results
      setCurrentPageResults(allAccumulatedResults.slice(0, resultsPerPage))
    } else {
      // Filter results by driver name (case-insensitive)
      const filtered = allAccumulatedResults.filter(result =>
        result.driver_name.toLowerCase().includes(query.toLowerCase())
      )
      console.log(`Filtered results: ${filtered.length} matches`)
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

  const handlePageChange = (page) => {
    console.log(`Going to page ${page}`)
    const displayResults = getDisplayResults()
    const startIdx = page * resultsPerPage
    const endIdx = startIdx + resultsPerPage
    setCurrentPageResults(displayResults.slice(startIdx, endIdx))
    setCurrentPage(page)
  }

  const handleNextPage = () => {
    const displayResults = getDisplayResults()
    const maxPage = Math.ceil(displayResults.length / resultsPerPage) - 1
    if (currentPage < maxPage) {
      handlePageChange(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleFirstPage = () => {
    handlePageChange(0)
  }

  const fetchAllResultsForYear = async (year) => {
    try {
      setLoading(true)
      setError(null)
      setCurrentPage(0)

      console.log(`=== FETCHING FERRARI RESULTS FOR YEAR ${year} ===`)

      // Call backend endpoint
      const url = `http://localhost:3001/api/openf1/ferrari-year/${year}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`)
      }

      let results = await response.json()

      console.log(`✓ Received ${results.length} Ferrari results for year ${year}`)

      // If empty, wait and retry (for background fetching)
      if (results.length === 0) {
        console.log(`No results yet, waiting for background fetch...`)
        setCurrentPageResults([])
        setAllAccumulatedResults([])

        // Retry after 3 seconds
        setTimeout(() => {
          console.log(`Retrying fetch for year ${year}...`)
          fetchAllResultsForYear(year)
        }, 3000)

        setLoading(false)
        return
      }

      console.log(`✓ Got ${results.length} results!`)

      setAllAccumulatedResults(results)
      setCurrentPageResults(results.slice(0, resultsPerPage))
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
              Page {currentPage + 1} of {Math.ceil(getDisplayResults().length / resultsPerPage) || 1}
            </span>
            <PaginationButton
              onClick={handleNextPage}
              disabled={currentPage >= Math.ceil(getDisplayResults().length / resultsPerPage) - 1}
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
