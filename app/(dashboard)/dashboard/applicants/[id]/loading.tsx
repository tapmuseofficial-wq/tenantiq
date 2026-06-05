import { Skeleton } from '@/components/ui/skeleton'

export default function ApplicantLoading() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Score / Recommendation / Verification */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 space-y-3"
            style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Skeleton className="h-3 w-24" />
            {i === 0
              ? <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              : <>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </>
            }
          </div>
        ))}
      </div>

      {/* AI summary */}
      <div
        className="rounded-2xl p-5 space-y-2"
        style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}
      >
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Info grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="px-6 py-4 space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score breakdown */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="px-6 py-4 space-y-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
