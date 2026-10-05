"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  demoSessionKey,
  authenticateDemoUser,
  readDemoSession,
  type DemoUser,
} from "./demo-user"

type DemoSession = {
  user: DemoUser | null
  ready: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const SessionContext = createContext<DemoSession | null>(null)

export function DemoSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(readDemoSession())
    setReady(true)

    function syncSession(event: StorageEvent) {
      if (event.key === demoSessionKey || event.key === null) {
        setUser(readDemoSession())
      }
    }

    window.addEventListener("storage", syncSession)
    return () => window.removeEventListener("storage", syncSession)
  }, [])

  function login(email: string, password: string) {
    const matchedUser = authenticateDemoUser(email, password)
    if (!matchedUser) return false
    localStorage.setItem(demoSessionKey, JSON.stringify(matchedUser))
    setUser(matchedUser)
    return true
  }

  function logout() {
    localStorage.removeItem(demoSessionKey)
    setUser(null)
  }

  return (
    <SessionContext value={{ user, ready, login, logout }}>
      {children}
    </SessionContext>
  )
}

export function useDemoSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error("useDemoSession requires DemoSessionProvider")
  return session
}

export function RequireDemoSession({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, ready } = useDemoSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (ready && !user) router.replace("/login")
  }, [ready, user, router, pathname])

  if (!ready || !user) return null
  return children
}
