import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { ComparisonTable } from '@/components/dashboard/comparison-table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids: idsRaw } = await searchParams
  const ids = idsRaw?.split(',').filter(Boolean) || []

  // Enforce count bounds and validate each id is a proper UUID before
  // passing them to the database query.
  if (ids.length < 2 || ids.length > 4 || ids.some(id => !UUID_RE.test(id))) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`*, properties (name, monthly_rent, landlord_id)`)
    .in('id', ids)

  if (error || !applications || applications.length < 2) notFound()

  for (const app of applications) {
    const property = app.properties as { name: string; monthly_rent: number; landlord_id: string }
    if (property.landlord_id !== user!.id) notFound()
  }

  const appsWithRent = applications.map(app => ({
    ...app,
    monthly_rent: (app.properties as { monthly_rent: number }).monthly_rent,
  }))

  const propertyName = (applications[0].properties as { name: string }).name

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 back-btn flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Applicant Comparison</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Comparing {applications.length} applicants for {propertyName}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 px-0 overflow-x-auto">
          <ComparisonTable applications={appsWithRent as any} />
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        {applications.map(app => (
          <Link
            key={app.id}
            href={`/dashboard/applicants/${app.id}`}
            className="text-sm font-semibold px-4 py-2 rounded-xl view-btn-blue transition-all duration-200"
          >
            View {app.full_name} →
          </Link>
        ))}
      </div>
    </div>
  )
}
