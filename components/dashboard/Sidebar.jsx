'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/sources',   label: 'Sources',   icon: '🔌' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
]

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || 'PB'

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#1a1d27] border-r border-gray-800 flex flex-col">

      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-sm">⚡</div>
          <span className="text-white font-semibold">PulseBoard</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <span className="text-gray-400 text-xs truncate flex-1">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span>🚪</span>
          Sign out
        </button>
      </div>

    </aside>
  )
}