import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { authApi } from "../service"
import type { User } from "../types"

// interface AuthValue {
//   user: User | null
//   loading: boolean
//   signIn: (email: string, password: string) => Promise<void>
//   signOut: () => void
//   reload: () => Promise<void>
// }

export const AuthContext = createContext<AuthValue | null>(null)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!localStorage.getItem("ACCESS_TOKEN")) {
      setUser(null)
      return
    }
    try {
      setUser((await authApi.me()).data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [reload])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password)
      localStorage.setItem("ACCESS_TOKEN", res.data.access_token)
      localStorage.setItem("REFRESH_TOKEN", res.data.refresh_token)
      await reload()
    },
    [reload]
  )

  const signOut = useCallback(() => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, signIn, signOut, reload }), [user, loading, signIn, signOut, reload])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
