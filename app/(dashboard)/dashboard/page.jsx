import { createServerSupabaseClient } from '@/lib/supabase/server'
import KPICard from '@/components/dashboard/KPICard'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } }  = await supabase.auth.getUser()
  const { data: sources }   = await supabase
    .from('data_sources')
    .select('*')
    .order('created_at', { ascending: false })

  const githubCount = sources?.filter(s => s.type === 'github').length || 0
  const csvCount    = sources?.filter(s => s.type === 'csv').length    || 0
  const greet       = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const kpis = [
    { label: 'Total Sources', value: sources?.length || 0, icon: '🔌', change: 'connected',       color: 'indigo', delay: 0   },
    { label: 'GitHub Repos',  value: githubCount,          icon: '⚡', change: 'accounts linked', color: 'violet', delay: 120 },
    { label: 'CSV Datasets',  value: csvCount,             icon: '📁', change: 'files uploaded',  color: 'blue',   delay: 240 },
    { label: 'Status',        value: 'Live',               icon: '🟢', change: 'all systems go',  color: 'green',  delay: 360 },
  ]

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-semibold text-[#00D4FF] uppercase tracking-[0.18em] mb-2">Analytics</p>
            <h1 className="text-3xl font-bold text-[#E2E8F0] tracking-tight">{greet} 👋</h1>
            <p className="text-[#3D5166] text-sm mt-1">
              {user?.email} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div
            className="text-right px-4 py-2.5 rounded-xl"
            style={{ border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(0,212,255,0.03)' }}
          >
            <p className="text-[9px] text-[#3D5166] uppercase tracking-widest">Active</p>
            <p className="text-sm text-[#00D4FF] font-semibold mono mt-0.5">{sources?.length || 0} sources</p>
          </div>
        </div>
        <div className="mt-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,212,255,0.2), transparent)' }} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* Sources list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(0,212,255,0.08)', background: 'rgba(13,20,33,0.5)' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}
        >
          <h2 className="text-sm font-semibold text-[#E2E8F0]">Connected Sources</h2>
          <span className="text-[10px] font-semibold mono text-[#00D4FF]">{sources?.length || 0} total</span>
        </div>

        {sources && sources.length > 0 ? (
          <div>
            {sources.map((source, i) => (
              <div
                key={source.id}
                className="animate-fade-in-up flex items-center gap-4 px-6 py-4 transition-colors"
                style={{
                  borderBottom:   i < sources.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none',
                  animationDelay: `${i * 50}ms`,
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
                  <p className="text-xs text-[#3D5166] mt-0.5">
                    {source.type.toUpperCase()} · Added {new Date(source.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.18)' }}
                >
                  active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}
            >
              🔌
            </div>
            <p className="text-sm font-medium text-[#E2E8F0]">No sources connected</p>
            <p className="text-xs text-[#3D5166] mt-1">Go to <span className="text-[#00D4FF]">Sources</span> to connect your first data source</p>
          </div>
        )}
      </div>

    </div>
  )
}