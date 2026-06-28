'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SourcesClient({ initialSources }) {
  const [sources, setSources]             = useState(initialSources)
  const [activeTab, setActiveTab]         = useState('github')
  const [githubUsername, setGithubUsername] = useState('')
  const [githubToken, setGithubToken]     = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [success, setSuccess]             = useState(null)
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
      const repos = await reposRes.json()

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
          type: 'github',
          name: `GitHub: ${githubUser.login}`,
          config: {
            username:     githubUsername,
            avatar_url:   githubUser.avatar_url,
            public_repos: githubUser.public_repos,
            followers:    githubUser.followers,
            following:    githubUser.following,
            total_stars:  totalStars,
            languages,
            repos: repos.slice(0, 20).map(r => ({
              name:       r.name,
              stars:      r.stargazers_count,
              forks:      r.forks_count,
              language:   r.language,
              updated_at: r.updated_at,
            })),
          },
        })
        .select()
        .single()

      if (dbError) throw dbError

      setSources(prev => [data, ...prev])
      setSuccess(`✓ GitHub account "${githubUser.login}" connected!`)
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
          const val = values[i]
          obj[header] = isNaN(val) || val === '' ? val : parseFloat(val)
          return obj
        }, {})
      })

      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: dbError } = await supabase
        .from('data_sources')
        .insert({
          user_id: user.id,
          type: 'csv',
          name: `CSV: ${file.name}`,
          config: {
            filename:  file.name,
            headers,
            rows:      rows.slice(0, 500),
            row_count: rows.length,
          },
        })
        .select()
        .single()

      if (dbError) throw dbError

      setSources(prev => [data, ...prev])
      setSuccess(`✓ "${file.name}" uploaded — ${rows.length} rows detected.`)
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

      {/* Connector panel */}
      <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-6">
        <div className="flex gap-2 mb-6">
          {['github', 'csv'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'github' ? '⚡ GitHub' : '📁 CSV Upload'}
            </button>
          ))}
        </div>

        {activeTab === 'github' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">GitHub Username *</label>
              <input
                type="text"
                value={githubUsername}
                onChange={e => setGithubUsername(e.target.value)}
                placeholder="e.g. Vishal-subudhi"
                className="w-full max-w-md bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Personal Access Token{' '}
                <span className="text-gray-600">(optional — increases API rate limit)</span>
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={e => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full max-w-md bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={connectGitHub}
              disabled={loading || !githubUsername.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Connecting...' : 'Connect GitHub'}
            </button>
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Upload a CSV with a header row. Numeric columns will be auto-detected for charting.
            </p>
            <label className={`cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-full max-w-md border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-8 text-center transition-colors">
                <p className="text-3xl mb-2">📁</p>
                <p className="text-sm text-gray-400">Click to upload a CSV file</p>
                <p className="text-xs text-gray-600 mt-1">Max 500 rows stored</p>
              </div>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            </label>
          </div>
        )}

        {error   && <div className="mt-4 bg-red-500/10   border border-red-500/30   rounded-lg px-4 py-3 text-red-400   text-sm">{error}</div>}
        {success && <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm">{success}</div>}
      </div>

      {/* Sources list */}
      <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-medium text-white mb-4">
          Connected Sources <span className="text-gray-500 font-normal">({sources.length})</span>
        </h2>
        {sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map(source => (
              <div key={source.id} className="flex items-center gap-4 p-4 bg-[#0f1117] rounded-lg border border-gray-800">
                <span className="text-xl">{source.type === 'github' ? '⚡' : '📁'}</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{source.name}</p>
                  <p className="text-xs text-gray-500">
                    {source.type === 'github'
                      ? `${source.config.public_repos} repos · ${source.config.followers} followers · ${source.config.total_stars} ⭐`
                      : `${source.config.row_count} rows · ${source.config.headers?.length} columns`
                    }
                  </p>
                </div>
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/30">
                  {source.type}
                </span>
                <button
                  onClick={() => deleteSource(source.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors ml-2"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No sources yet. Add one above.</p>
        )}
      </div>

    </div>
  )
}