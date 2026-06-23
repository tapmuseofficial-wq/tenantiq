import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile and total community review count in parallel.
  // The review count requires the service client because RLS on tenant_ratings
  // only exposes a landlord's own records to the anon session.
  const serviceSupabase = createServiceClient()
  const [{ data: profile }, { count: communityCount }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    serviceSupabase.from('tenant_ratings').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0F1E' }}>
      <Sidebar profile={profile} communityCount={communityCount ?? 0} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
