'use client'

import { useEffect, useState } from 'react'
import { Bookmark, X } from 'lucide-react'

interface FutureRatingPromptProps {
  applicationId: string
  tenantName: string
}

const STORAGE_KEY = 'tenantiq_rating_bookmarks'

function getBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveBookmark(applicationId: string) {
  try {
    const bookmarks = getBookmarks()
    bookmarks.add(applicationId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]))
  } catch {}
}

export function FutureRatingPrompt({ applicationId, tenantName }: FutureRatingPromptProps) {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash
  const [bookmarked, setBookmarked] = useState(false)

  // Read localStorage only on the client after mount
  useEffect(() => {
    const alreadyBookmarked = getBookmarks().has(applicationId)
    setBookmarked(alreadyBookmarked)
    setDismissed(alreadyBookmarked)
  }, [applicationId])

  function handleBookmark() {
    saveBookmark(applicationId)
    setBookmarked(true)
    // Brief delay so the user sees the confirmation before it collapses
    setTimeout(() => setDismissed(true), 1200)
  }

  function handleDismiss() {
    saveBookmark(applicationId) // treat dismiss the same as bookmark
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{
        background: 'rgba(15,22,41,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}
      >
        <Bookmark className="w-4 h-4 text-violet-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 mb-0.5">
          After this tenancy ends, come back and rate{' '}
          <span className="text-violet-400">{tenantName}</span>.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Every review protects another landlord in the TenantIQ community.
          You&apos;ll also earn a free screening credit for each rating you submit.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#A78BFA',
            }}
          >
            {bookmarked ? (
              <>✓ Bookmarked</>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                Remind me to rate later
              </>
            )}
          </button>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="text-slate-700 hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
