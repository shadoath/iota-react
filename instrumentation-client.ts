import posthog from 'posthog-js'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

if (key) {
  posthog.init(key, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    capture_exceptions: true,
    autocapture: false,
    persistence: 'localStorage+cookie',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.opt_out_capturing()
      }
    },
  })
} else {
  console.debug('[analytics] No POSTHOG_KEY — tracking disabled')
}

// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://e8fa47bc56d7c448a8c8c859f5d6cd03@o4511168942243840.ingest.us.sentry.io/4511168945586176',

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
