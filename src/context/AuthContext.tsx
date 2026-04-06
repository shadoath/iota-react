"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "../lib/supabase"
import { identifyUser, resetUser } from "../analytics/posthog"

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
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
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
    const name =
      user?.user_metadata?.full_name ??
      user?.user_metadata?.name ??
      user?.email?.split("@")[0] ??
      null

    setState({
      user,
      session,
      loading: false,
      isAuthenticated: !!user,
      displayName: name,
      avatarUrl: user?.user_metadata?.avatar_url ?? null,
    })

    // Identify user in analytics
    if (user) {
      identifyUser(user.id, { name, email: user.email })
    } else {
      resetUser()
    }
  }, [])

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return

    const supabase = createClient()

    // Handle OAuth PKCE code in URL (e.g. /?code=xxx after redirect)
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    if (code) {
      // Clean the code from the URL immediately
      const cleanUrl = new URL(window.location.href)
      cleanUrl.searchParams.delete("code")
      window.history.replaceState({}, "", cleanUrl.toString())

      supabase.auth.exchangeCodeForSession(code).then(({ data: { session } }) => {
        handleSession(session)
      })
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        handleSession(session)
      })
    }

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
        redirectTo: window.location.origin,
      },
    })
  }, [])

  const signInWithGithub = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) return
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    })
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!SUPABASE_CONFIGURED) return { error: "Auth not configured" }
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!SUPABASE_CONFIGURED) return { error: "Auth not configured" }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { error: error.message }
    return { error: null }
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
        signInWithEmail,
        signUpWithEmail,
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
