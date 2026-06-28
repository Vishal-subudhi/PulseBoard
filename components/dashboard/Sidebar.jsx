'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/sources',   label: 'Sources',   icon: '⬡' },
  { href: '/analytics', label: 'Analytics', icon: '◉' },
]

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || 'PB'

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #080E1A 0%, #070B14 100%)',
        borderRight: '1px solid rgba(0,212,255,0.07)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0D1B2E, #142338)',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 12px rgba(0,212,255,0.1)',
            }}
          >
            ⚡
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E2E8F0] tracking-tight leading-none mb-1">PulseBoard</p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-status absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-semibold text-emerald-500 tracking-[0.12em] uppercase">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[9px] font-semibold text-[#1E2D40] uppercase tracking-[0.15em]">Workspace</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive ? 'text-[#00D4FF]' : 'text-[#3D5166] hover:text-[#E2E8F0]'
              }`}
              style={isActive ? {
                background:  'rgba(0,212,255,0.06)',
                borderLeft:  '2px solid #00D4FF',
                paddingLeft: '10px',
              } : {
                borderLeft:  '2px solid transparent',
              }}
            >
              <span className={`text-base transition-colors ${isActive ? 'text-[#00D4FF]' : 'text-[#2D4A63] group-hover:text-[#4A6278]'}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-[#00D4FF] flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
        <div className="flex items-center gap-3 px-3 py-3 mt-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #0077AA)',
              color: '#070B14',
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#4A5568] truncate">{user.email}</p>
            <p className="text-[9px] text-[#1E2D40] tracking-widest uppercase mt-0.5">Free plan</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] text-[#2D4A63] hover:text-red-400 transition-colors"
          style={{ border: '1px solid rgba(0,212,255,0.05)' }}
        >
          <span className="text-base group-hover:scale-110 transition-transform">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}