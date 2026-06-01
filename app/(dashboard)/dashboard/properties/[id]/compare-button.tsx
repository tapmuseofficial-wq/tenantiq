'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { Application } from '@/types'
import { Button } from '@/components/ui/button'

interface CompareButtonProps {
  applications: Application[]
}

export function CompareButton({ applications }: CompareButtonProps) {
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const router = useRouter()

  if (!selecting) {
    return (
      <Button variant="outline" size="sm" onClick={() => setSelecting(true)}>
        <SlidersHorizontal className="w-4 h-4" />
        Compare
      </Button>
    )
  }

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  function handleCompare() {
    if (selected.length >= 2) {
      router.push(`/dashboard/compare?ids=${selected.join(',')}`)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-slate-500">Select 2–4 applicants:</span>
      {applications.filter(a => a.status === 'complete').map(app => (
        <button
          key={app.id}
          onClick={() => toggle(app.id)}
          className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
            selected.includes(app.id)
              ? 'bg-brand-700 border-brand-700 text-white'
              : 'border-slate-300 text-slate-600 hover:border-brand-400'
          }`}
        >
          {app.full_name}
        </button>
      ))}
      <Button
        size="sm"
        onClick={handleCompare}
        disabled={selected.length < 2}
      >
        Compare {selected.length > 0 ? `(${selected.length})` : ''}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => { setSelecting(false); setSelected([]) }}>
        Cancel
      </Button>
    </div>
  )
}
