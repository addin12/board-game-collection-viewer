import { ImageResponse } from 'next/og'

export const alt = 'Barudak Board Game Club — community collection hub'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: 'linear-gradient(135deg, #1c3528 0%, #13241d 70%)',
          color: '#f7e6c8',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <svg width="64" height="64" viewBox="0 0 100 100">
            <path
              d="M50 8c-8 0-14 6-14 13 0 4 2 8 5 10-3 1-6 3-8 5-4-2-9-1-11 3-2 4-1 9 3 11 1 0 1 1 1 2-2 5-3 10-3 15 0 3 2 5 5 5h44c3 0 5-2 5-5 0-5-1-10-3-15 0-1 0-2 1-2 4-2 5-7 3-11-2-4-7-5-11-3-2-2-5-4-8-5 3-2 5-6 5-10 0-7-6-13-14-13z"
              fill="#c89034"
            />
          </svg>
          <span style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '4px', color: '#c89034' }}>BBGC</span>
        </div>
        <div style={{ fontSize: '92px', fontWeight: 700, marginTop: '28px', lineHeight: 1.04 }}>
          Barudak Board Game Club
        </div>
        <div style={{ fontSize: '34px', color: '#b6c8bb', marginTop: '26px', maxWidth: '900px' }}>
          Pool the community&apos;s shelves · see what fits the table tonight · call the next session
        </div>
      </div>
    ),
    { ...size }
  )
}
