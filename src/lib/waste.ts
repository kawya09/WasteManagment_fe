import { Boxes, Cpu, Leaf, Recycle, Sofa, Skull, Trash2, type LucideIcon } from "lucide-react"
import type { PickupStatus, WasteType } from "../types"

export const WASTE: Record<WasteType, { label: string; color: string; soft: string; icon: LucideIcon; hint: string; pointsPerKg: number }> = {
  GENERAL: { label: "General", color: "#64748b", soft: "#e8edf2", icon: Trash2, hint: "Non-recyclable household waste", pointsPerKg: 2 },
  RECYCLABLE: { label: "Recyclable", color: "#2b7fd0", soft: "#e1eefb", icon: Recycle, hint: "Paper, glass, plastic, metal", pointsPerKg: 10 },
  ORGANIC: { label: "Organic", color: "#1e9e5a", soft: "#e3f3e8", icon: Leaf, hint: "Food scraps and garden waste", pointsPerKg: 6 },
  HAZARDOUS: { label: "Hazardous", color: "#dc4b3e", soft: "#fde8e5", icon: Skull, hint: "Paint, chemicals, medicines", pointsPerKg: 12 },
  E_WASTE: { label: "E-waste", color: "#e5a800", soft: "#fff3c4", icon: Cpu, hint: "Electronics and batteries", pointsPerKg: 15 },
  BULKY: { label: "Bulky", color: "#e07a2f", soft: "#fdeedd", icon: Sofa, hint: "Furniture and appliances", pointsPerKg: 4 }
}
export const WASTE_TYPES = Object.keys(WASTE) as WasteType[]
export const WasteFallbackIcon = Boxes

export const STATUS_STYLE: Record<PickupStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-sun-soft text-[#8a6500]" },
  ASSIGNED: { label: "Driver assigned", cls: "bg-[#e1eefb] text-[#1d5f9f]" },
  IN_PROGRESS: { label: "On the way", cls: "bg-leaf-soft text-leaf-deep" },
  COLLECTED: { label: "Collected", cls: "bg-leaf text-white" },
  CANCELLED: { label: "Cancelled", cls: "bg-[#eceeed] text-muted" }
}

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-GB", opts)

export const todayInput = () => new Date().toISOString().slice(0, 10)

export const errMsg = (e: any, fallback = "Something went wrong. Try again.") =>
  e?.response?.data?.message || fallback

export const binColor = (status: string) => (status === "CRITICAL" ? "#dc4b3e" : status === "WARNING" ? "#e5a800" : "#1e9e5a")
