function SessionResultsTable({ results }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatSessionType = (type) => {
    if (!type) return 'N/A'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="sessions-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Session Type</th>
            <th>Circuit</th>
            <th>Date</th>
            <th>Laps</th>
            <th>Position</th>
            <th>Driver</th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((result, index) => (
              <tr key={`${result.session_key}-${result.driver_number}-${index}`}>
                <td>{formatSessionType(result.session_type)}</td>
                <td>{result.circuit_short_name || 'N/A'}</td>
                <td>{formatDate(result.date_end)}</td>
                <td className="center">{result.number_of_laps || 'N/A'}</td>
                <td className="center">{result.final_position || 'DNF'}</td>
                <td>{result.driver_name || 'Unknown'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">No session results found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default SessionResultsTable
