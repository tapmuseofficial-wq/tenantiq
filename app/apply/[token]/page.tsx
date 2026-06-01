import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ApplicationForm } from '@/components/apply/application-form'
import { formatCurrency } from '@/lib/utils'
import { Home, Shield, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ApplyPage({ params }: { params: { token: string } }) {
  const supabase = createServiceClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('screening_token', params.token)
    .eq('is_active', true)
    .single()

  if (error || !property) notFound()

  return (
    <div className="min-h-screen" style={{ background: '#0A0F1E' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }}
        />
      </div>

      {/* Top bar */}
      <div
        className="relative"
        style={{ background: 'rgba(10,15,30,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 12px rgba(59,130,246,0.35)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-200 text-sm">TenantIQ</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
            <Shield className="w-3.5 h-3.5" />
            Secure application
          </div>
        </div>
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8">
        {/* Property card */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            background: 'rgba(15,22,41,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.15) 100%)',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              <Home className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-tight">{property.name}</h1>
              {property.address && (
                <p className="text-slate-400 text-sm mt-1">{property.address}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span
                  className="font-bold text-sm"
                  style={{ color: '#60A5FA' }}
                >
                  {formatCurrency(property.monthly_rent)}/mo
                </span>
                {property.bedrooms && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="text-slate-400 text-sm">
                      {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                      {property.bathrooms ? `, ${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''}` : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(15,22,41,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100">Rental Application</h2>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              Fill out this form to apply. Your information is kept private and only shared with the landlord.
            </p>
          </div>
          <ApplicationForm property={property} />
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by TenantIQ · Your data is encrypted and secure
        </p>
      </div>
    </div>
  )
}
