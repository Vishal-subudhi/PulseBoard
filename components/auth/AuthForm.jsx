'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AuthForm({ mode }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const router   = useRouter()
  const supabase = createClient()
  const isLogin  = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#070B14] bg-grid flex items-center justify-center px-4 overflow-hidden">

      {/* Ambient orbs */}
      <div
        className="animate-orb pointer-events-none absolute -top-56 -left-56 w-[560px] h-[560px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 70%)' }}
      />
      <div
        className="animate-orb pointer-events-none absolute -bottom-56 -right-56 w-[480px] h-[480px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', animationDelay: '-5s' }}
      />

      <div className="relative w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: 'linear-gradient(135deg, #0D1B2E, #142338)',
                border: '1px solid rgba(0,212,255,0.3)',
                boxShadow: '0 0 16px rgba(0,212,255,0.12)',
              }}
            >
              ⚡
            </div>
            <span className="text-2xl font-semibold text-cyan-gradient tracking-tight">PulseBoard</span>
          </div>
          <p className="text-[#4A5568] text-sm">
            {isLogin ? 'Sign in to your analytics workspace' : 'Create your analytics workspace'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-[#E2E8F0] mb-6">
            {isLogin ? 'Welcome back' : 'Get started'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-[#4A5568] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#4A5568] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="min. 6 characters"
                required
                minLength={6}
                className="input-field w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3 animate-fade-in"
                style={{ background: 'rgba(229,62,62,0.07)', border: '1px solid rgba(229,62,62,0.2)' }}
              >
                <span className="text-red-400 text-sm mt-0.5 flex-shrink-0">⚠</span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#070B14]/30 border-t-[#070B14] rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.07)' }} />
            <span className="text-[10px] text-[#2D3748]">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.07)' }} />
          </div>

          <p className="text-center text-sm text-[#4A5568] mt-5">
            {isLogin ? "New to PulseBoard? " : 'Already have an account? '}
            <Link
              href={isLogin ? '/signup' : '/login'}
              className="text-[#00D4FF] hover:text-white transition-colors font-medium"
            >
              {isLogin ? 'Create account' : 'Sign in'}
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-[#1A2230] mt-5 tracking-widest uppercase">
          Your data is private · Always
        </p>
      </div>
    </div>
  )
}