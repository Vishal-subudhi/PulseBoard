'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AuthForm({ mode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const isLogin = mode === 'login'

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
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-lg">⚡</div>
            <span className="text-xl font-semibold text-white">PulseBoard</span>
          </div>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Sign in to your analytics dashboard' : 'Create your analytics account'}
          </p>
        </div>

        <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-8">
          <h2 className="text-lg font-medium text-white mb-6">
            {isLogin ? 'Welcome back' : 'Get started'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={isLogin ? '/signup' : '/login'}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}