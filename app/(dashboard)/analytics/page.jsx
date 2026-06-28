import { createServerSupabaseClient } from '@/lib/supabase/server'
import AnalyticsClient from '@/components/dashboard/AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient()
  const { data: sources } = await supabase
    .from('data_sources')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Visualize your connected data sources</p>
      </div>
      <AnalyticsClient sources={sources || []} />
    </div>
  )
}