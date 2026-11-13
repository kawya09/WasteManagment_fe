export type Role = "ADMIN" | "DRIVER" | "CITIZEN"
export type WasteType = "GENERAL" | "RECYCLABLE" | "ORGANIC" | "HAZARDOUS" | "E_WASTE" | "BULKY"
export type PickupStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COLLECTED" | "CANCELLED"
export type LatLng = { lat: number; lng: number }

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  area: string
  roles: Role[]
  ecoPoints: number
  badges: string[]
  createdAt?: string
}

export interface Pickup {
  _id: string
  citizen: { _id: string; name: string; email: string; area?: string } | string
  driver?: { _id: string; name: string } | null
  wasteType: WasteType
  estimatedKg: number
  actualKg: number
  address: string
  location?: LatLng | null
  scheduledDate: string
  notes: string
  status: PickupStatus
  pointsAwarded: number
  createdAt: string
}

export interface Bin {
  _id: string
  code: string
  name: string
  area: string
  address: string
  wasteType: WasteType
  location: LatLng
  capacityL: number
  fillLevel: number
  status: "OK" | "WARNING" | "CRITICAL"
  lastEmptiedAt: string
  lastReadingAt: string
}

export interface Report {
  _id: string
  reporter?: { name: string; email: string } | string
  title: string
  description: string
  address: string
  location?: LatLng | null
  severity: "LOW" | "MEDIUM" | "HIGH"
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "REJECTED"
  adminNote: string
  createdAt: string
}

export interface Schedule {
  _id: string
  area: string
  wasteType: WasteType
  dayOfWeek: number
  time: string
}

export interface Badge {
  id: string
  name: string
  description: string
}

export interface Level {
  name: string
  index: number
  nextName: string | null
  nextAt: number | null
  progress: number
}

export interface MyStats {
  ecoPoints: number
  level: Level
  rank: number
  badges: Badge[]
  lockedBadges: Badge[]
  totalKg: number
  co2SavedKg: number
  byType: { type: WasteType; kg: number; count: number }[]
  upcoming: Pickup[]
  history: Pickup[]
}

export interface Overview {
  totals: {
    collectedKg: number
    recyclingRate: number
    co2SavedKg: number
    pickupsPending: number
    pickupsActive: number
    pickupsCollected: number
    openReports: number
    citizens: number
    drivers: number
  }
  byType: { type: WasteType; kg: number; count: number }[]
  monthly: { label: string; kg: number; diverted: number; count: number }[]
  areas: { area: string; kg: number }[]
  bins: { total: number; critical: number; warning: number; averageFill: number; needsEmptying: Bin[] }
}

export interface Classification {
  item: string
  category: WasteType
  binColor: string
  binLabel: string
  recyclable: boolean
  confidence: number
  tips: string[]
  source: "ai" | "rules"
}

export interface RouteStop {
  order: number
  kind: "pickup" | "bin"
  id: string
  label: string
  detail: string
  lat: number
  lng: number
  legKm: number
  cumulativeKm: number
  etaMin: number
}

export interface RoutePlan {
  start: LatLng
  route: RouteStop[]
  totalKm: number
  unoptimisedKm: number
  savedPercent: number
  estimatedMinutes: number
  skippedWithoutLocation: number
}
