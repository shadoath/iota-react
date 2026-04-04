/**
 * API route to initialize the Socket.io server.
 * Next.js 14 doesn't natively support WebSocket in app router,
 * so this provides a health check endpoint. The actual Socket.io
 * server is attached via the custom server (server.ts at project root).
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'Socket.io server runs via custom server' })
}
