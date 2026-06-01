'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Property name is required'),
  address: z.string().optional(),
  unit: z.string().optional(),
  city: z.string().optional(),
  province_state: z.string().optional(),
  country: z.enum(['CA', 'US']),
  monthly_rent: z.coerce.number().min(1, 'Monthly rent is required'),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
})
type FormData = z.infer<typeof schema>

export default function NewPropertyPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { country: 'CA' },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: property, error: dbError } = await supabase
      .from('properties')
      .insert({
        ...data,
        landlord_id: user.id,
        screening_token: nanoid(12),
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        address: data.address || null,
        unit: data.unit || null,
        city: data.city || null,
        province_state: data.province_state || null,
      })
      .select('id')
      .single()

    if (dbError) {
      setError('Failed to create property. Please try again.')
      return
    }

    router.push(`/dashboard/properties/${property.id}`)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/properties"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">New Screening Link</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create a link to collect tenant applications</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 text-sm">Property Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Property Name *"
              placeholder="e.g., 123 Main St Unit 2B, or 'Downtown Condo'"
              {...register('name')}
              error={errors.name?.message}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monthly Rent *"
                type="number"
                placeholder="2500"
                hint="In your local currency"
                {...register('monthly_rent')}
                error={errors.monthly_rent?.message}
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Country *</label>
                <select
                  {...register('country')}
                  className="block w-full rounded-xl px-4 py-3 text-sm text-slate-100 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    outline: 'none',
                  }}
                >
                  <option value="CA" style={{ background: '#0F1629' }}>Canada</option>
                  <option value="US" style={{ background: '#0F1629' }}>United States</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 text-sm">
              Address <span className="text-slate-500 font-normal">(optional)</span>
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input label="Street Address" placeholder="123 Main Street" {...register('address')} />
              </div>
              <Input label="Unit" placeholder="2B" {...register('unit')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" placeholder="Toronto" {...register('city')} />
              <Input label="Province / State" placeholder="ON" {...register('province_state')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 text-sm">
              Unit Details <span className="text-slate-500 font-normal">(optional)</span>
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Bedrooms" type="number" placeholder="2" {...register('bedrooms')} />
              <Input label="Bathrooms" type="number" step="0.5" placeholder="1.5" {...register('bathrooms')} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div
            className="flex items-center gap-3 rounded-xl p-3.5"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting} size="lg">
            Create Screening Link
          </Button>
          <Link href="/dashboard/properties">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
