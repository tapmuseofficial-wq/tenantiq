import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Building2, ArrowRight } from 'lucide-react'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: properties } = await supabase
    .from('properties')
    .select(`*, applications (count)`)
    .eq('landlord_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Properties</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Manage your screening links</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            boxShadow: '0 0 20px rgba(59,130,246,0.3)',
          }}
        >
          <Plus className="w-4 h-4" />
          New Property
        </Link>
      </div>

      {(properties || []).length === 0 ? (
        <div
          className="py-20 text-center rounded-2xl"
          style={{
            background: 'rgba(15,22,41,0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <Building2 className="w-8 h-8 text-blue-400/40" />
          </div>
          <h3 className="font-semibold text-slate-300 mb-1.5">No properties yet</h3>
          <p className="text-sm text-slate-500 mb-7">
            Create your first screening link and start collecting applications.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              boxShadow: '0 0 20px rgba(59,130,246,0.3)',
            }}
          >
            <Plus className="w-4 h-4" />
            Create screening link
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {(properties || []).map((prop) => {
            const applicantCount = (prop.applications as { count: number }[])?.[0]?.count || 0

            return (
              <div
                key={prop.id}
                className="p-6 rounded-2xl transition-all duration-200"
                style={{
                  background: 'rgba(15,22,41,0.75)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="font-semibold text-slate-100 text-base">{prop.name}</h3>
                      {!prop.is_active && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}
                        >
                          Inactive
                        </span>
                      )}
                    </div>
                    {prop.address && (
                      <p className="text-sm text-slate-500 mb-2">{prop.address}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-blue-400">{formatCurrency(prop.monthly_rent)}/mo</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500">Created {formatDate(prop.created_at)}</span>
                    </div>

                    {/* Screening link */}
                    <div className="mt-4 flex items-center gap-2">
                      <div
                        className="flex-1 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 truncate"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {process.env.NEXT_PUBLIC_APP_URL}/apply/{prop.screening_token}
                      </div>
                      <CopyLinkButton token={prop.screening_token} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-200">{applicantCount}</div>
                      <div className="text-xs text-slate-500">applicants</div>
                    </div>
                    <Link
                      href={`/dashboard/properties/${prop.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl view-btn-blue"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
