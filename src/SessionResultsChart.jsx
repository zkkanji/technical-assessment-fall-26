import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

export default function SessionResultsChart({ results }) {
  if (!results || results.length === 0) {
    return <div className="chart-empty">No data to display</div>
  }

  // Prepare data for chart
  const chartData = results.map(result => ({
    date: new Date(result.date_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    laps: result.number_of_laps,
    driverName: result.driver_name,
    position: result.final_position,
    fullDate: result.date_end
  }))

  // Sort by date
  chartData.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))

  return (
    <div className="chart-container">
      <h3>Laps vs Session Date</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 0, 0.2)" />
          <XAxis
            dataKey="date"
            stroke="#ff0000"
            style={{ fontSize: '0.85rem' }}
          />
          <YAxis
            stroke="#ff0000"
            label={{ value: 'Number of Laps', angle: -90, position: 'insideLeft' }}
            style={{ fontSize: '0.85rem' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              border: '2px solid #ff0000',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            cursor={{ stroke: '#ff0000', strokeWidth: 2 }}
            formatter={(value, name) => {
              if (name === 'laps') return [value, 'Laps']
              return value
            }}
          />
          <Legend
            wrapperStyle={{ color: '#ff0000', fontSize: '0.9rem' }}
          />
          <Line
            type="monotone"
            dataKey="laps"
            stroke="#ff0000"
            strokeWidth={3}
            dot={{ fill: '#ff0000', r: 5 }}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
