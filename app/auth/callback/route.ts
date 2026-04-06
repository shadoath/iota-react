import { NextResponse } from "next/server"
import { createClient } from "../../../src/lib/supabase"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect back to the game
  return NextResponse.redirect(origin)
}
