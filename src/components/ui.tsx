import { Loader2, type LucideIcon } from "lucide-react"
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react"
import { WASTE } from "../lib/waste"
import type { WasteType } from "../types"

/* ---------- buttons ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "sun" | "ghost" | "danger"
  size?: "sm" | "md"
  loading?: boolean
  icon?: LucideIcon
}
const VARIANT = {
  primary: "bg-forest text-white hover:bg-forest-2",
  sun: "bg-sun text-forest hover:bg-sun-deep",
  ghost: "bg-white text-ink border border-line hover:bg-leaf-soft",
  danger: "bg-white text-alert border border-[#f0c9c5] hover:bg-[#fde8e5]"
}
export function Button({ variant = "primary", size = "md", loading, icon: Icon, children, className = "", disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm"
      } ${VARIANT[variant]} ${className}`}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" />}
      {children}
    </button>
  )
}

/* ---------- surfaces ---------- */
export const Card = ({ children, className = "", leaf = false }: { children: ReactNode; className?: string; leaf?: boolean }) => (
  <div className={`bg-white border border-line ${leaf ? "leaf" : "rounded-2xl"} ${className}`}>{children}</div>
)

export const Pill = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
)

export const WastePill = ({ type }: { type: WasteType }) => {
  const w = WASTE[type]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: w.soft, color: w.color }}>
      <w.icon className="size-3.5" />
      {w.label}
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-xl text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Stat({ icon: Icon, label, value, hint, tone = "leaf" }: { icon: LucideIcon; label: string; value: ReactNode; hint?: string; tone?: "leaf" | "sun" | "forest" }) {
  const tones = { leaf: "bg-leaf-soft text-leaf-deep", sun: "bg-sun-soft text-[#8a6500]", forest: "bg-forest text-sun" }
  return (
    <Card className="p-4">
      <div className={`mb-3 grid size-10 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="size-5" />
      </div>
      <div className="font-display text-2xl font-extrabold text-forest">{value}</div>
      <div className="text-sm text-muted">{label}</div>
      {hint && <div className="mt-1 text-xs text-leaf-deep">{hint}</div>}
    </Card>
  )
}

export const Spinner = ({ label = "Loading" }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-muted" role="status">
    <Loader2 className="size-5 animate-spin text-leaf" /> {label}
  </div>
)

export function Empty({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-sun-soft text-[#8a6500]">
        <Icon className="size-6" />
      </div>
      <h3 className="text-lg font-bold text-forest">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export const ErrorNote = ({ message }: { message: string }) =>
  message ? <div role="alert" className="rounded-xl border border-[#f0c9c5] bg-[#fde8e5] px-4 py-3 text-sm text-alert">{message}</div> : null

/* ---------- form controls ---------- */
const control = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-[#9db0a5] focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/25"

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-forest">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${control} ${p.className ?? ""}`} />
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${control} ${p.className ?? ""}`} />
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={`${control} min-h-24 ${p.className ?? ""}`} />

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-forest/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-forest">{title}</h2>
        {children}
      </div>
    </div>
  )
}

/* ---------- data viz ---------- */
export function Ring({ value, size = 120, stroke = 12, color = "#ffc72c", track = "rgba(255,255,255,.18)", children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function FillBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e9efe9]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export function BarChart({ data }: { data: { label: string; kg: number; diverted: number }[] }) {
  const max = Math.max(10, ...data.map((d) => d.kg))
  const H = 160
  return (
    <div>
      <div className="flex h-[200px] items-end gap-3 sm:gap-5" role="img" aria-label="Waste collected per month">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-end justify-center gap-1" style={{ height: H }}>
              <div className="w-1/2 max-w-7 rounded-t-md bg-leaf" style={{ height: `${(d.kg / max) * 100}%` }} title={`${d.kg} kg total`} />
              <div className="w-1/2 max-w-7 rounded-t-md bg-sun" style={{ height: `${(d.diverted / max) * 100}%` }} title={`${d.diverted} kg diverted`} />
            </div>
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-leaf" /> All waste (kg)</span>
        <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-sun" /> Diverted from landfill (kg)</span>
      </div>
    </div>
  )
}

export function Donut({ data }: { data: { type: WasteType; kg: number }[] }) {
  const total = data.reduce((s, d) => s + d.kg, 0)
  const r = 54
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 140 140" className="-rotate-90" role="img" aria-label="Waste by type">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#edf3ee" strokeWidth="18" />
          {total > 0 &&
            data.map((d) => {
              const len = (d.kg / total) * c
              const el = <circle key={d.type} cx="70" cy="70" r={r} fill="none" stroke={WASTE[d.type].color} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
              offset += len
              return el
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-xl font-extrabold text-forest">{total.toLocaleString()}</div>
            <div className="text-xs text-muted">kg collected</div>
          </div>
        </div>
      </div>
      <ul className="min-w-40 flex-1 space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.type} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full" style={{ background: WASTE[d.type].color }} />{WASTE[d.type].label}</span>
            <span className="font-semibold text-forest">{total ? Math.round((d.kg / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
