'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang='en'>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          An error has been reported. Please try again.
        </p>
        <button
          type='button'
          onClick={reset}
          style={{
            padding: '0.75rem 2rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  )
}
