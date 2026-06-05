import { Skeleton } from '@/components/ui/skeleton'

export default function PropertiesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Property cards */}
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                {/* Screening link */}
                <div className="flex items-center gap-2 mt-4">
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center space-y-1">
                  <Skeleton className="h-8 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
