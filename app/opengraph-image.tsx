import { ImageResponse } from 'next/og'

export const alt = 'TenantIQ — AI Tenant Screening for Landlords'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0F1E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 90px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 52 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
            </svg>
          </div>
          <span style={{ fontSize: 38, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-1px' }}>
            TenantIQ
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: '#F1F5F9',
            lineHeight: 1.1,
            marginBottom: 28,
            letterSpacing: '-2px',
          }}
        >
          AI Tenant Screening
          <br />
          <span style={{ color: '#60A5FA' }}>for Landlords</span>
        </div>

        {/* Subline */}
        <div style={{ fontSize: 28, color: '#94A3B8', lineHeight: 1.5, marginBottom: 52 }}>
          Score applicants out of 100 · Verify income automatically · Catch fake pay stubs
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['Free to try', 'AI-powered', '< 2 min per applicant'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '12px 24px',
                borderRadius: 100,
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.35)',
                color: '#60A5FA',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
