import { useCallback, useEffect, useState } from "react"

/** Loads data on mount and exposes a reload() for after mutations. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps)

  const reload = useCallback(async () => {
    try {
      setError("")
      setData(await run())
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not load data")
    } finally {
      setLoading(false)
    }
  }, [run])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, setData, loading, error, reload }
}
