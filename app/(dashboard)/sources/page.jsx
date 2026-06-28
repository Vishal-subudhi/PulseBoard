import { createServerSupabaseClient } from '@/lib/supabase/server'
import SourcesClient from '@/components/dashboard/SourcesClient'

export default async function SourcesPage() {
  const supabase = createServerSupabaseClient()
  const { data: sources } = await supabase
    .from('data_sources')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Data Sources</h1>
        <p className="text-gray-400 text-sm mt-1">Connect GitHub or upload a CSV to start analyzing your data</p>
      </div>
      <SourcesClient initialSources={sources || []} />
    </div>
  )
}