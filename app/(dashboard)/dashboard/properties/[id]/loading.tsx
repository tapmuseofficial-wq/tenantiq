import { Skeleton } from '@/components/ui/skeleton'

export default function PropertyDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Screening link card */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.14)' }}
      >
        <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      {/* Applicants table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <Skeleton className="h-5 w-36" />
        </div>
        {/* Table header */}
        <div
          className="px-6 py-3.5 grid grid-cols-7 gap-4"
          style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
        {/* Rows */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 grid grid-cols-7 gap-4 items-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-4 mx-auto" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
