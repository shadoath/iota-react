"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "../lib/supabase"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  displayName: string | null
  avatarUrl: string | null
}

interface AuthContextValue extends AuthState {
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: SUPABASE_CONFIGURED, // only loading if Supabase is configured
    isAuthenticated: false,
    displayName: null,
    avatarUrl: null,
  })

  const handleSession = useCallback((session: Session | null) => {
    const user = session?.user ?? null
    setState({
      user,
      session,
      loading: false,
      isAuthenticated: !!user,
      displayName:
        user?.user_metadata?.full_name ??
        user?.user_metadata?.name ??
        user?.email?.split("@")[0] ??
        null,
      avatarUrl: user?.user_metadata?.avatar_url ?? null,
    })
  }, [])

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return

    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => subscription.unsubscribe()
  }, [handleSession])

  const signInWithGoogle = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) return
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }, [])

  const signInWithGithub = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) return
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) return
    const supabase = createClient()
    await supabase.auth.signOut()
    setState({
      user: null,
      session: null,
      loading: false,
      isAuthenticated: false,
      displayName: null,
      avatarUrl: null,
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signInWithGithub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { SUPABASE_CONFIGURED }
