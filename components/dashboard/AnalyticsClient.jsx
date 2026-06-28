'use client'

import { useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import useDashboardStore from '@/store/dashboardStore'

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#4f46e5', '#818cf8', '#c4b5fd', '#ddd6fe']

export default function AnalyticsClient({ sources }) {
  const { selectedSourceId, chartType, setSelectedSource, setChartType } = useDashboardStore()

  // On first load, default to the first source if nothing is selected yet
  useEffect(() => {
    if (!selectedSourceId && sources.length > 0) {
      setSelectedSource(sources[0].id)
    }
  }, [sources, selectedSourceId, setSelectedSource])

  const selectedSource = sources.find(s => s.id === selectedSourceId) || sources[0] || null

  if (sources.length === 0) {
    return (
      <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-16 text-center">
        <p className="text-4xl mb-3">📈</p>
        <p className="text-white font-medium">No sources connected</p>
        <p className="text-gray-400 text-sm mt-1">Go to Sources to connect GitHub or upload a CSV first</p>
      </div>
    )
  }

  function getChartData() {
    if (!selectedSource) return []

    if (selectedSource.type === 'github') {
      return selectedSource.config.repos?.slice(0, 15).map(repo => ({
        name:  repo.name.length > 12 ? repo.name.slice(0, 12) + '…' : repo.name,
        Stars: repo.stars,
        Forks: repo.forks,
      })) || []
    }

    if (selectedSource.type === 'csv') {
      const { headers, rows } = selectedSource.config
      if (!rows || rows.length === 0) return []
      const labelKey    = headers.find(h => typeof rows[0]?.[h] === 'string') || headers[0]
      const numericKeys = headers.filter(h => typeof rows[0]?.[h] === 'number')
      return rows.slice(0, 20).map(row => {
        const point = { name: String(row[labelKey]).slice(0, 14) }
        numericKeys.slice(0, 3).forEach(key => { point[key] = row[key] })
        return point
      })
    }

    return []
  }

  function getPieData() {
    if (!selectedSource) return []
    if (selectedSource.type === 'github') {
      return Object.entries(selectedSource.config.languages || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, value]) => ({ name, value }))
    }
    const chartData = getChartData()
    const dataKeys  = Object.keys(chartData[0] || {}).filter(k => k !== 'name')
    return chartData.slice(0, 7).map(d => ({ name: d.name, value: d[dataKeys[0]] || 0 }))
  }

  const chartData = getChartData()
  const dataKeys  = chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== 'name') : []

  const tooltipStyle = {
    contentStyle: { background: '#1e2130', border: '1px solid #374151', borderRadius: 8, color: '#fff' },
  }

  function renderChart() {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          No chart data available for this source
        </div>
      )
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis                tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis                tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'pie') {
      const pieData = getPieData()
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#4b5563' }}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      )
    }
  }

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-6">
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Data Source</label>
            <select
              value={selectedSource?.id || ''}
              onChange={e => setSelectedSource(e.target.value)}
              className="bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 min-w-52"
            >
              {sources.map(source => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Chart Type</label>
            <div className="flex gap-2">
              {[
                { type: 'bar',  icon: '📊' },
                { type: 'line', icon: '📈' },
                { type: 'pie',  icon: '🥧' },
              ].map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    chartType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {icon} {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-medium text-white mb-1">
          {selectedSource?.type === 'github' ? 'Repository Performance' : 'Dataset Overview'}
        </h2>
        <p className="text-xs text-gray-500 mb-6">{selectedSource?.name}</p>
        {renderChart()}
      </div>

      {/* GitHub stat cards */}
      {selectedSource?.type === 'github' && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Public Repos', value: selectedSource.config.public_repos, icon: '📦' },
            { label: 'Total Stars',  value: selectedSource.config.total_stars,  icon: '⭐' },
            { label: 'Followers',    value: selectedSource.config.followers,    icon: '👥' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1e2130] border border-gray-800 rounded-xl p-5">
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* CSV column info */}
      {selectedSource?.type === 'csv' && selectedSource.config.headers && (
        <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-medium text-white mb-4">Dataset Columns</h2>
          <div className="flex flex-wrap gap-2">
            {selectedSource.config.headers.map(h => (
              <span key={h} className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30">
                {h}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {selectedSource.config.row_count} total rows · Chart shows first 20
          </p>
        </div>
      )}

    </div>
  )
}