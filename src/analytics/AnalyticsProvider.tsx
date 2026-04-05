'use client'

import { useEffect } from 'react'
import { trackError } from './posthog'

export function AnalyticsProvider() {
  useEffect(() => {
    // Global error tracking (supplements PostHog capture_exceptions)
    const handleError = (event: ErrorEvent) => {
      trackError(event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('unhandled_rejection', {
        reason: String(event.reason),
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
