import { ImageResponse } from 'next/og'

export const alt = 'Naymly. Never blank on a name again.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#4167C9',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#C3D4F9',
            letterSpacing: '-0.02em',
          }}
        >
          Naymly
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 82,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 900,
          }}
        >
          Never blank on a name again.
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            color: '#C3D4F9',
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          Capture who you met in 20 seconds. Get the brief 15 minutes before you
          see them next.
        </div>
      </div>
    ),
    size,
  )
}
