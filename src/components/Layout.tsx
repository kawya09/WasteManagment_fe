import { CalendarDays, LayoutDashboard, LogOut, Map, Megaphone, Menu, PackagePlus, Route, ScanSearch, Trophy, Truck, Users, ClipboardList, X, type LucideIcon } from "lucide-react"
import { useState } from "react"// react vala state aka hadaganna
import { NavLink, Outlet } from "react-router-dom"// page athata navigation karanna , layout aka athule venath pages penvanna
import { useAuth } from "../hooks/useAuth" // login vela inna userge details laba ganna
import type { Role } from "../types" // userge role type aka haduna gannna

export const Logo = ({ light = true }: { light?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <svg viewBox="0 0 64 64" className="size-9" aria-hidden>
      <rect width="64" height="64" rx="16" fill={light ? "#ffc72c" : "#0b3d2e"} />
      <path d="M20 22h24l-2.5 26a3 3 0 0 1-3 2.7h-13a3 3 0 0 1-3-2.7L20 22Z" fill={light ? "#0b3d2e" : "#ffc72c"} />
      <path d="M17 22h30M27 22v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" stroke="#1e9e5a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M32 29v14M26 36l6-7 6 7" stroke={light ? "#ffc72c" : "#0b3d2e"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
    <span className={`font-display text-xl font-extrabold ${light ? "text-white" : "text-forest"}`}>EcoCollect</span>
  </div>
)

interface NavItem { to: string; label: string; icon: LucideIcon; roles: Role[] }
const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["CITIZEN", "DRIVER", "ADMIN"] },
  { to: "/pickups/new", label: "Request pickup", icon: PackagePlus, roles: ["CITIZEN"] },
  { to: "/pickups", label: "My pickups", icon: ClipboardList, roles: ["CITIZEN"] },
  { to: "/tasks", label: "My tasks", icon: Truck, roles: ["DRIVER"] },
  { to: "/manage/pickups", label: "Pickups", icon: ClipboardList, roles: ["ADMIN"] },
  { to: "/route", label: "Route planner", icon: Route, roles: ["DRIVER", "ADMIN"] },
  { to: "/bins", label: "Smart bins", icon: Map, roles: ["CITIZEN", "DRIVER", "ADMIN"] },
  { to: "/assistant", label: "Sorting assistant", icon: ScanSearch, roles: ["CITIZEN"] },
  { to: "/reports", label: "Illegal dumping", icon: Megaphone, roles: ["CITIZEN", "ADMIN"] },
  { to: "/rewards", label: "Eco rewards", icon: Trophy, roles: ["CITIZEN"] },
  { to: "/schedule", label: "Schedule", icon: CalendarDays, roles: ["CITIZEN", "DRIVER", "ADMIN"] },
  { to: "/users", label: "Users", icon: Users, roles: ["ADMIN"] }
]

// Highest-privilege role decides which menu a person sees// userta roles kihipayak thibunoth pradana role aka thoranava
export const primaryRole = (roles: Role[]): Role => (roles.includes("ADMIN") ? "ADMIN" : roles.includes("DRIVER") ? "DRIVER" : "CITIZEN")
// sidebar, header, navigation, page content aka akata sambanda karanavna
export default function Layout() {
  const { user, signOut } = useAuth() // give two data details of login user and logout funtion
  const [open, setOpen] = useState(false) // mobile sidebar open or close palanaya karanava
  if (!user) return null // user login velada balanava
  const role = primaryRole(user.roles) // userge role akaaa adala menu items thoranava
  const items = NAV.filter((n) => n.roles.includes(role))
// design left sidebar
  const sidebar = (
    <div className="flex h-full flex-col bg-forest px-4 py-5 text-white">
      <div className="mb-8 flex items-center justify-between px-2">
        <Logo />
        <button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X className="size-5" /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Main">
        {items.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === "/" || n.to === "/pickups"}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-sun text-forest" : "text-white/75 hover:bg-white/10 hover:text-white"}`
            }
          >
            <n.icon className="size-[18px]" />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 rounded-2xl bg-forest-2 p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-sun font-bold text-forest">{user.name.charAt(0).toUpperCase()}</div> // name mul achura kapital
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-xs text-white/60">{role === "CITIZEN" ? `${user.ecoPoints} eco points` : role.toLowerCase()}</div>
          </div>
          <button onClick={signOut} aria-label="Sign out" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><LogOut className="size-4" /></button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside> // desktop screen ake sidebar

      <header className="sticky top-0 z-30 flex items-center justify-between bg-forest px-4 py-3 text-white lg:hidden">
        <Logo />
        <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="size-6" /></button>
      </header>
      {open && (// mobile sidebar
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      )}
         
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  )
}

