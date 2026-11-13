import { useToast } from "../components/Toast"
import { Card, PageHeader, Spinner } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import { useAsync } from "../hooks/useAsync"
import { errMsg, fmtDate } from "../lib/waste"
import { userApi } from "../service"
import type { Role, User } from "../types"

const ROLES: Role[] = ["CITIZEN", "DRIVER", "ADMIN"]

export default function Users() {
  const { user: me } = useAuth()
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => userApi.list().then((r) => r.data))

  const toggle = async (u: User, role: Role) => {
    const next = u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role]
    try {
      await userApi.setRoles(u.id ?? (u as any)._id, next)
      toast(`${u.name} updated`)
      reload()
    } catch (e) {
      toast(errMsg(e), "error")
    }
  }

  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Users" subtitle="Promote citizens to drivers or admins. A person needs at least one role." />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-leaf-soft text-forest"><tr>{["Name", "Area", "Joined", "Roles"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((u) => {
              const id = u.id ?? (u as any)._id
              return (
                <tr key={id}>
                  <td className="px-4 py-3"><div className="font-semibold text-forest">{u.name}</div><div className="text-xs text-muted">{u.email}</div></td>
                  <td className="px-4 py-3 text-muted">{u.area}</td>
                  <td className="px-4 py-3 text-muted">{u.createdAt ? fmtDate(u.createdAt) : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {ROLES.map((r) => {
                        const on = u.roles.includes(r)
                        const lockSelf = id === me?.id && r === "ADMIN" && on
                        return (
                          <button key={r} disabled={lockSelf || (on && u.roles.length === 1)} aria-pressed={on} onClick={() => toggle(u, r)} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${on ? "bg-forest text-white" : "bg-[#e9efe9] text-muted hover:bg-leaf-soft"}`}>
                            {r.toLowerCase()}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}
