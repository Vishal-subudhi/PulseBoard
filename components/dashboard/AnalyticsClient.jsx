'use client'

import { useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import useDashboardStore from '@/store/dashboardStore'

const COLORS = ['#00D4FF', '#A78BFA', '#10B981', '#F59E0B', '#60A5FA', '#F472B6', '#34D399']

export default function AnalyticsClient({ sources }) {
  const { selectedSourceId, chartType, setSelectedSource, setChartType } = useDashboardStore()

  useEffect(() => {
    if (!selectedSourceId && sources.length > 0) setSelectedSource(sources[0].id)
  }, [sources, selectedSourceId, setSelectedSource])

  const selectedSource = sources.find(s => s.id === selectedSourceId) || sources[0] || null

  if (sources.length === 0) {
    return (
      <div className="rounded-xl p-16 text-center"
        style={{ border: '1px solid rgba(0,212,255,0.08)', background: 'rgba(13,20,33,0.5)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
          📈
        </div>
        <p className="text-sm font-medium text-[#E2E8F0]">No data to visualize</p>
        <p className="text-xs text-[#3D5166] mt-1">Go to Sources to connect GitHub or upload a CSV</p>
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
        .sort((a, b) => b[1] - a[1]).slice(0, 7)
        .map(([name, value]) => ({ name, value }))
    }
    const data     = getChartData()
    const dataKeys = Object.keys(data[0] || {}).filter(k => k !== 'name')
    return data.slice(0, 7).map(d => ({ name: d.name, value: d[dataKeys[0]] || 0 }))
  }

  const chartData  = getChartData()
  const dataKeys   = chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== 'name') : []
  const axisStyle  = { fill: '#3D5166', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }
  const gridStyle  = { stroke: 'rgba(0,212,255,0.05)', strokeDasharray: '4 4' }
  const tooltipStyle = {
    contentStyle: {
      background: '#0D1421', border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 10, color: '#E2E8F0', fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace',
    },
    cursor: { fill: 'rgba(0,212,255,0.04)' },
  }

  function renderChart() {
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-72 text-[#3D5166] text-sm">No chart data for this source</div>
    }

    if (chartType === 'bar') return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#3D5166', fontSize: 12, paddingTop: 16 }} />
          {dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={36} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )

    if (chartType === 'line') return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#3D5166', fontSize: 12, paddingTop: 16 }} />
          {dataKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key}
              stroke={COLORS[i % COLORS.length]} strokeWidth={2}
              dot={{ r: 3, fill: COLORS[i % COLORS.length] }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )

    if (chartType === 'pie') {
      const pieData = getPieData()
      return (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name"
              cx="50%" cy="50%" outerRadius={120} innerRadius={48} paddingAngle={3}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#2D3748' }}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      )
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Controls */}
      <div className="rounded-xl px-6 py-5 flex flex-wrap items-end gap-6"
        style={{ border: '1px solid rgba(0,212,255,0.08)', background: 'rgba(13,20,33,0.5)' }}>
        <div>
          <label className="block text-[9px] font-semibold text-[#4A5568] uppercase tracking-[0.15em] mb-2">Data Source</label>
          <select
            value={selectedSource?.id || ''}
            onChange={e => setSelectedSource(e.target.value)}
            className="input-field rounded-xl px-4 py-2.5 text-sm min-w-[220px] cursor-pointer"
          >
            {sources.map(source => (
              <option key={source.id} value={source.id} style={{ background: '#0D1421' }}>{source.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-semibold text-[#4A5568] uppercase tracking-[0.15em] mb-2">Chart Type</label>
          <div className="flex gap-1.5">
            {[{ type: 'bar', label: 'Bar' }, { type: 'line', label: 'Line' }, { type: 'pie', label: 'Pie' }].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  chartType === type ? 'text-[#070B14]' : 'text-[#3D5166] hover:text-[#E2E8F0]'
                }`}
                style={chartType === type
                  ? { background: '#00D4FF', boxShadow: '0 0 16px rgba(0,212,255,0.3)' }
                  : { background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(0,212,255,0.08)', background: 'rgba(13,20,33,0.5)' }}>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
          <div>
            <p className="text-[9px] font-semibold text-[#4A5568] uppercase tracking-[0.15em]">
              {selectedSource?.type === 'github' ? 'Repository Performance' : 'Dataset Overview'}
            </p>
            <p className="text-sm font-medium text-[#E2E8F0] mt-0.5">{selectedSource?.name}</p>
          </div>
          <span className="text-[9px] font-semibold mono px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.15)' }}>
            {chartType} chart
          </span>
        </div>
        <div className="p-6">{renderChart()}</div>
      </div>

      {/* GitHub stat cards */}
      {selectedSource?.type === 'github' && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Public Repos', value: selectedSource.config.public_repos, icon: '📦', bg: 'rgba(0,212,255,0.07)',   border: 'rgba(0,212,255,0.15)',   text: '#00D4FF' },
            { label: 'Total Stars',  value: selectedSource.config.total_stars,  icon: '⭐', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
            { label: 'Followers',    value: selectedSource.config.followers,    icon: '👥', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.15)', text: '#A78BFA' },
          ].map(stat => (
            <div key={stat.label} className="animate-fade-in-up rounded-xl p-5 transition-transform hover:scale-[1.02]"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
              <p className="text-xl mb-3">{stat.icon}</p>
              <p className="text-2xl font-bold text-[#E2E8F0] mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: stat.text }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* CSV column info */}
      {selectedSource?.type === 'csv' && selectedSource.config.headers && (
        <div className="rounded-xl p-6"
          style={{ border: '1px solid rgba(0,212,255,0.08)', background: 'rgba(13,20,33,0.5)' }}>
          <p className="text-[9px] font-semibold text-[#4A5568] uppercase tracking-[0.15em] mb-4">Dataset Columns</p>
          <div className="flex flex-wrap gap-2">
            {selectedSource.config.headers.map(h => (
              <span key={h} className="text-xs px-3 py-1 rounded-full mono"
                style={{ background: 'rgba(0,212,255,0.07)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.15)' }}>
                {h}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#3D5166] mt-4 mono">{selectedSource.config.row_count} rows · displaying first 20</p>
        </div>
      )}

    </div>
  )
}