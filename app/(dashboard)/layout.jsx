import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar user={user} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}