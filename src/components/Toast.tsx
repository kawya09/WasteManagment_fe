import { CheckCircle2, X, XCircle } from "lucide-react"
import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

type Toast = { id: number; text: string; kind: "ok" | "error" }
const ToastCtx = createContext<(text: string, kind?: "ok" | "error") => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((text: string, kind: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random()
    setItems((l) => [...l, { id, text, kind }])
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4200)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[2000] flex w-[min(92vw,22rem)] flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${t.kind === "ok" ? "bg-forest text-white" : "bg-alert text-white"}`}>
            {t.kind === "ok" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sun" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
            <span className="flex-1">{t.text}</span>
            <button aria-label="Dismiss" onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))}><X className="size-4 opacity-70" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
