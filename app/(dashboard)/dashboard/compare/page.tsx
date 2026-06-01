import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ComparisonTable } from '@/components/dashboard/comparison-table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
  ids?: string
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const ids = searchParams.ids?.split(',').filter(Boolean) || []

  if (ids.length < 2 || ids.length > 4) {
    redirect('/dashboard')
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      *,
      properties (name, monthly_rent, landlord_id)
    `)
    .in('id', ids)

  if (error || !applications || applications.length < 2) notFound()

  // Verify landlord owns all these applications
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
      <div className="flex items-center gap-3">
        <Link href={`/dashboard`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicant Comparison</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Comparing {applications.length} applicants for {propertyName}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ComparisonTable applications={appsWithRent as any} />
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        {applications.map(app => (
          <Link
            key={app.id}
            href={`/dashboard/applicants/${app.id}`}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium border border-brand-200 hover:border-brand-300 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            View {app.full_name} full report →
          </Link>
        ))}
      </div>
    </div>
  )
}
