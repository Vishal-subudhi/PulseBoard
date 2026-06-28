import { createServerSupabaseClient } from '@/lib/supabase/server'
import KPICard from '@/components/dashboard/KPICard'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sources } = await supabase
    .from('data_sources')
    .select('*')
    .order('created_at', { ascending: false })

  const githubCount = sources?.filter(s => s.type === 'github').length || 0
  const csvCount    = sources?.filter(s => s.type === 'csv').length    || 0

  const kpis = [
    { label: 'Total Sources', value: sources?.length || 0, icon: '🔌', change: 'connected',       color: 'indigo' },
    { label: 'GitHub Repos',  value: githubCount,          icon: '⚡', change: 'accounts linked', color: 'violet' },
    { label: 'CSV Datasets',  value: csvCount,             icon: '📁', change: 'files uploaded',  color: 'blue'   },
    { label: 'Status',        value: 'Live',               icon: '🟢', change: 'all systems go',  color: 'green'  },
  ]

  const greet = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening' 

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{greet} {user?.name} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.email} · Your analytics at a glance</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="bg-[#1e2130] border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-medium text-white mb-4">Connected Sources</h2>
        {sources && sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map(source => (
              <div key={source.id} className="flex items-center gap-3 p-3 bg-[#0f1117] rounded-lg border border-gray-800">
                <span className="text-lg">{source.type === 'github' ? '⚡' : '📁'}</span>
                <div>
                  <p className="text-sm text-white font-medium">{source.name}</p>
                  <p className="text-xs text-gray-500">
                    {source.type.toUpperCase()} · Added {new Date(source.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/30">
                    active
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🔌</p>
            <p className="text-sm">No sources connected yet.</p>
            <p className="text-xs mt-1">Go to <span className="text-indigo-400">Sources</span> to add your first one.</p>
          </div>
        )}
      </div>
    </div>
  )
}