import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </div>
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applicants card */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Properties card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="w-4 h-4" />
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
