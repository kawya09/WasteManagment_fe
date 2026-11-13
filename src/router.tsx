import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import { Spinner } from "./components/ui"
import { useAuth } from "./hooks/useAuth"
import type { Role } from "./types"
import { Login, Register } from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import RequestPickup from "./pages/RequestPickup"
import { DriverTasks, ManagePickups, MyPickups } from "./pages/Pickups"
import Bins from "./pages/Bins"
import RoutePlanner from "./pages/RoutePlanner"
import Reports from "./pages/Reports"
import Assistant from "./pages/Assistant"
import Rewards from "./pages/Rewards"
import Schedule from "./pages/Schedule"
import Users from "./pages/Users"

function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-paper"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.some((r) => user.roles.includes(r))) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-forest">No access</h2>
        <p className="mt-1 text-sm text-muted">Your account doesn't have permission to open this page.</p>
      </div>
    )
  }
  return <>{children}</>
}

const guard = (el: ReactNode, roles: Role[]) => <RequireAuth roles={roles}>{el}</RequireAuth>

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pickups/new" element={guard(<RequestPickup />, ["CITIZEN"])} />
          <Route path="/pickups" element={guard(<MyPickups />, ["CITIZEN"])} />
          <Route path="/tasks" element={guard(<DriverTasks />, ["DRIVER", "ADMIN"])} />
          <Route path="/manage/pickups" element={guard(<ManagePickups />, ["ADMIN"])} />
          <Route path="/route" element={guard(<RoutePlanner />, ["DRIVER", "ADMIN"])} />
          <Route path="/bins" element={<Bins />} />
          <Route path="/assistant" element={guard(<Assistant />, ["CITIZEN"])} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/rewards" element={guard(<Rewards />, ["CITIZEN"])} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/users" element={guard(<Users />, ["ADMIN"])} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
