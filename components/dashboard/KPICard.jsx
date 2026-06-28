'use client'

import { useEffect, useState } from 'react'

const colorMap = {
  indigo: { bg: 'rgba(0,212,255,0.05)',   border: 'rgba(0,212,255,0.15)',   icon: 'rgba(0,212,255,0.08)',   text: '#00D4FF' },
  violet: { bg: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.15)', icon: 'rgba(167,139,250,0.08)', text: '#A78BFA' },
  blue:   { bg: 'rgba(96,165,250,0.05)',  border: 'rgba(96,165,250,0.15)',  icon: 'rgba(96,165,250,0.08)',  text: '#60A5FA' },
  green:  { bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.15)',  icon: 'rgba(16,185,129,0.08)',  text: '#10B981' },
}

export default function KPICard({ label, value, icon, change, color, delay = 0 }) {
  const isNumeric     = typeof value === 'number'
  const [count, setCount] = useState(isNumeric ? 0 : value)
  const c             = colorMap[color] || colorMap.indigo

  useEffect(() => {
    if (!isNumeric) return
    const timer = setTimeout(() => {
      const duration = 1100
      const start    = Date.now()
      function tick() {
        const elapsed  = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased    = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(value * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, isNumeric, delay])

  return (
    <div
      className="animate-fade-in-up rounded-xl p-5 transition-transform duration-200 hover:scale-[1.02] cursor-default"
      style={{
        background:     c.bg,
        border:         `1px solid ${c.border}`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: c.icon, border: `1px solid ${c.border}` }}
        >
          {icon}
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: c.text }}>
          {change}
        </span>
      </div>
      <p
        className="text-3xl font-bold text-[#E2E8F0] tracking-tight mono"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {count}
      </p>
      <p className="text-xs text-[#3D5166] mt-1">{label}</p>
    </div>
  )
}