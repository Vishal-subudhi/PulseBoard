'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SourcesClient({ initialSources }) {
  const [sources, setSources]               = useState(initialSources)
  const [activeTab, setActiveTab]           = useState('github')
  const [githubUsername, setGithubUsername] = useState('')
  const [githubToken, setGithubToken]       = useState('')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState(null)
  const [success, setSuccess]               = useState(null)
  const supabase = createClient()

  async function connectGitHub() {
    if (!githubUsername.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const headers = { Accept: 'application/vnd.github.v3+json' }
      if (githubToken) headers['Authorization'] = `token ${githubToken}`

      const userRes = await fetch(`https://api.github.com/users/${githubUsername}`, { headers })
      if (!userRes.ok) throw new Error('GitHub user not found. Check the username.')
      const githubUser = await userRes.json()

      const reposRes = await fetch(
        `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`,
        { headers }
      )
      const repos      = await reposRes.json()
      const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
      const languages  = repos.reduce((acc, r) => {
        if (r.language) acc[r.language] = (acc[r.language] || 0) + 1
        return acc
      }, {})

      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: dbError } = await supabase
        .from('data_sources')
        .insert({
          user_id: user.id,
          type:    'github',
          name:    `GitHub: ${githubUser.login}`,
          config:  {
            username: githubUsername, avatar_url: githubUser.avatar_url,
            public_repos: githubUser.public_repos, followers: githubUser.followers,
            following: githubUser.following, total_stars: totalStars, languages,
            repos: repos.slice(0, 20).map(r => ({
              name: r.name, stars: r.stargazers_count, forks: r.forks_count,
              language: r.language, updated_at: r.updated_at,
            })),
          },
        })
        .select()
        .single()

      if (dbError) throw dbError
      setSources(prev => [data, ...prev])
      setSuccess(`Connected "${githubUser.login}" — ${repos.length} repos imported.`)
      setGithubUsername('')
      setGithubToken('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCSVUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const text    = await file.text()
      const lines   = text.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows    = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        return headers.reduce((obj, header, i) => {
          const val   = values[i]
          obj[header] = isNaN(val) || val === '' ? val : parseFloat(val)
          return obj
        }, {})
      })

      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: dbError } = await supabase
        .from('data_sources')
        .insert({
          user_id: user.id,
          type:    'csv',
          name:    `CSV: ${file.name}`,
          config:  { filename: file.name, headers, rows: rows.slice(0, 500), row_count: rows.length },
        })
        .select()
        .single()

      if (dbError) throw dbError
      setSources(prev => [data, ...prev])
      setSuccess(`"${file.name}" uploaded — ${rows.length} rows, ${headers.length} columns.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  async function deleteSource(id) {
    const { error } = await supabase.from('data_sources').delete().eq('id', id)
    if (!error) setSources(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-6">

      {/* Connector Panel */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(13,20,33,0.6)' }}
      >
        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
          {[{ id: 'github', label: 'GitHub', icon: '⚡' }, { id: 'csv', label: 'CSV Upload', icon: '📁' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id ? 'text-[#00D4FF]' : 'text-[#3D5166] hover:text-[#E2E8F0]'
              }`}
              style={activeTab === tab.id
                ? { borderBottom: '2px solid #00D4FF', background: 'rgba(0,212,255,0.04)' }
                : { borderBottom: '2px solid transparent' }
              }
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'github' && (
            <div className="space-y-4 max-w-md animate-fade-in">
              <div>
                <label className="block text-[9px] font-semibold text-[#4A5568] uppercase tracking-[0.15em] mb-2">
                  GitHub Username <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  placeholder="e.g. Vishal-subudhi"
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-[#4A5568] uppercase tracking-[0.15em] mb-2">
                  Personal Access Token
                  <span className="ml-2 normal-case font-normal text-[#2D3748]">(optional · increases rate limit)</span>
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  placeholder="ghp_••••••••••••"
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <button
                onClick={connectGitHub}
                disabled={loading || !githubUsername.trim()}
                className="btn-primary px-6 py-3 rounded-xl text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#070B14]/30 border-t-[#070B14] rounded-full animate-spin" />
                    Connecting…
                  </span>
                ) : 'Connect GitHub'}
              </button>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="max-w-md animate-fade-in">
              <p className="text-sm text-[#3D5166] mb-4">Upload any CSV with a header row. Numeric columns are auto-detected for charting.</p>
              <label className={`block cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div
                  className="rounded-xl p-10 text-center transition-all duration-200"
                  style={{ border: '2px dashed rgba(0,212,255,0.15)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'}
                >
                  <p className="text-3xl mb-3">📁</p>
                  <p className="text-sm font-medium text-[#E2E8F0]">Drop a CSV or click to browse</p>
                  <p className="text-xs text-[#3D5166] mt-1">Max 500 rows stored</p>
                </div>
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              </label>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3 animate-fade-in"
              style={{ background: 'rgba(229,62,62,0.07)', border: '1px solid rgba(229,62,62,0.18)' }}>
              <span className="text-red-400 text-sm mt-0.5">⚠</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3 animate-fade-in"
              style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}>
              <span className="text-emerald-400 text-sm mt-0.5">✓</span>
              <p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sources list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(0,212,255,0.08)', background: 'rgba(13,20,33,0.5)' }}
      >
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
          <h2 className="text-sm font-semibold text-[#E2E8F0]">Connected Sources</h2>
          <span className="text-[10px] font-semibold mono text-[#00D4FF]">{sources.length} total</span>
        </div>

        {sources.length > 0 ? (
          <div>
            {sources.map((source, i) => (
              <div
                key={source.id}
                className="animate-fade-in-up group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[rgba(0,212,255,0.02)]"
                style={{
                  borderBottom:   i < sources.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.14)' }}
                >
                  {source.type === 'github' ? '⚡' : '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#E2E8F0]">{source.name}</p>
                  <p className="text-xs text-[#3D5166] mt-0.5 mono">
                    {source.type === 'github'
                      ? `${source.config.public_repos} repos · ${source.config.followers} followers · ${source.config.total_stars}⭐`
                      : `${source.config.row_count} rows · ${source.config.headers?.length} cols`
                    }
                  </p>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.18)' }}>
                  {source.type}
                </span>
                <button
                  onClick={() => deleteSource(source.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#2D3748] hover:text-red-400 transition-all text-xl leading-none"
                  title="Remove source"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
              🔌
            </div>
            <p className="text-sm font-medium text-[#E2E8F0]">No sources yet</p>
            <p className="text-xs text-[#3D5166] mt-1">Connect GitHub or upload a CSV above</p>
          </div>
        )}
      </div>

    </div>
  )
}