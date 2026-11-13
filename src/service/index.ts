import api from "./api"
import type { Bin, Classification, MyStats, Overview, Pickup, Report, RoutePlan, Schedule, User, LatLng, WasteType } from "../types"

const d = <T,>(p: Promise<{ data: { data: T; message?: string } }>) => p.then((r) => r.data)

export const authApi = {
  login: (email: string, password: string) => d<{ access_token: string; refresh_token: string; roles: string[] }>(api.post("/auth/login", { email, password })),
  register: (body: { name: string; email: string; password: string; area: string }) => api.post("/auth/register", body).then((r) => r.data),
  me: () => d<User>(api.get("/auth/me"))
}

export const pickupApi = {
  create: (body: { wasteType: WasteType; estimatedKg: number; address: string; location: LatLng | null; scheduledDate: string; notes: string }) => d<Pickup>(api.post("/pickups", body)),
  mine: () => d<Pickup[]>(api.get("/pickups/mine")),
  all: (params?: Record<string, string>) => d<Pickup[]>(api.get("/pickups", { params })),
  tasks: () => d<Pickup[]>(api.get("/pickups/tasks")),
  assign: (id: string, driverId: string) => d<Pickup>(api.patch(`/pickups/${id}/assign`, { driverId })),
  setStatus: (id: string, status: "IN_PROGRESS" | "COLLECTED", actualKg?: number) =>
    api.patch(`/pickups/${id}/status`, { status, actualKg }).then((r) => r.data as { message: string; data: Pickup; newBadges: { name: string }[] }),
  cancel: (id: string) => d<Pickup>(api.patch(`/pickups/${id}/cancel`))
}

export const binApi = {
  list: () => d<Bin[]>(api.get("/bins")),
  create: (body: Record<string, unknown>) => d<Bin>(api.post("/bins", body)),
  remove: (id: string) => api.delete(`/bins/${id}`),
  simulate: () => d<Bin[]>(api.post("/bins/simulate")),
  empty: (id: string) => d<Bin>(api.post(`/bins/${id}/empty`)),
  reading: (id: string, fillLevel: number) => d<Bin>(api.patch(`/bins/${id}/reading`, { fillLevel }))
}

export const reportApi = {
  create: (body: Record<string, unknown>) => api.post("/reports", body).then((r) => r.data as { message: string; newBadges: { name: string }[] }),
  mine: () => d<Report[]>(api.get("/reports/mine")),
  all: () => d<Report[]>(api.get("/reports")),
  update: (id: string, body: { status?: string; adminNote?: string }) => d<Report>(api.patch(`/reports/${id}`, body))
}

export const scheduleApi = {
  list: () => d<Schedule[]>(api.get("/schedules")),
  create: (body: Record<string, unknown>) => d<Schedule>(api.post("/schedules", body)),
  remove: (id: string) => api.delete(`/schedules/${id}`)
}

export const userApi = {
  list: () => d<User[]>(api.get("/users")),
  drivers: () => d<{ _id: string; name: string; email: string }[]>(api.get("/users/drivers")),
  setRoles: (id: string, roles: string[]) => d<User>(api.patch(`/users/${id}/roles`, { roles })),
  leaderboard: () => d<{ top: { id: string; name: string; area: string; ecoPoints: number; level: string; badges: number }[]; myRank: number | null }>(api.get("/rewards/leaderboard"))
}

export const statsApi = {
  overview: () => d<Overview>(api.get("/stats/overview")),
  me: () => d<MyStats>(api.get("/stats/me"))
}

export const aiApi = { classify: (item: string) => d<Classification>(api.post("/ai/classify", { item })) }
export const routeApi = { optimise: (start?: LatLng) => d<RoutePlan>(api.get("/routes/optimize", { params: start })) }
