import { Check, CheckCircle2, ClipboardList, MapPin, Play, Truck, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../components/Toast"
import { Button, Card, Empty, Input, PageHeader, Pill, Select, Spinner, WastePill } from "../components/ui"
import { useAsync } from "../hooks/useAsync"
import { errMsg, fmtDate, STATUS_STYLE, WASTE_TYPES, WASTE } from "../lib/waste"
import { pickupApi, userApi } from "../service"
import type { Pickup, PickupStatus } from "../types"

const STEPS: PickupStatus[] = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COLLECTED"]

function Stepper({ status }: { status: PickupStatus }) {
  const idx = STEPS.indexOf(status)
  return (
    <ol className="mt-3 flex items-center gap-1.5" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col gap-1">
          <div className={`h-1.5 rounded-full ${i <= idx ? "bg-leaf" : "bg-[#e3ebe4]"}`} />
          <span className={`text-[11px] ${i <= idx ? "font-semibold text-forest" : "text-muted"}`}>{STATUS_STYLE[s].label}</span>
        </li>
      ))}
    </ol>
  )
}

/* ------------------------- citizen: my pickups ------------------------- */
export function MyPickups() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => pickupApi.mine().then((r) => r.data))
  const [tab, setTab] = useState<"open" | "done">("open")
  if (loading) return <Spinner />
  const list = (data ?? []).filter((p) => (tab === "open" ? ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(p.status) : ["COLLECTED", "CANCELLED"].includes(p.status)))

  const cancel = async (id: string) => {
    try {
      await pickupApi.cancel(id)
      toast("Pickup cancelled")
      reload()
    } catch (e) {
      toast(errMsg(e), "error")
    }
  }

  return (
    <>
      <PageHeader title="My pickups" action={<Link to="/pickups/new" className="rounded-xl bg-sun px-4 py-2.5 text-sm font-semibold text-forest hover:bg-sun-deep">New pickup</Link>} />
      <div className="mb-4 inline-flex rounded-xl bg-white p-1 ring-1 ring-line">
        {(["open", "done"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${tab === t ? "bg-forest text-white" : "text-muted"}`}>{t === "open" ? "Upcoming" : "History"}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty icon={ClipboardList} title={tab === "open" ? "No upcoming pickups" : "No history yet"} text="Request a pickup and track it here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <Card key={p._id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <WastePill type={p.wasteType} />
                <Pill className={STATUS_STYLE[p.status].cls}>{STATUS_STYLE[p.status].label}</Pill>
              </div>
              <div className="mt-3 flex items-start gap-1.5 text-sm text-ink"><MapPin className="mt-0.5 size-4 shrink-0 text-leaf" />{p.address}</div>
              <div className="mt-1 text-sm text-muted">{fmtDate(p.scheduledDate, { weekday: "long", day: "numeric", month: "long" })} · ~{p.estimatedKg} kg</div>
              {p.driver && <div className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Truck className="size-4" /> {p.driver.name}</div>}
              {p.status !== "CANCELLED" && <Stepper status={p.status} />}
              {p.status === "COLLECTED" && <div className="mt-3 rounded-xl bg-sun-soft px-3 py-2 text-sm font-semibold text-[#6b5200]">{p.actualKg} kg collected · +{p.pointsAwarded} eco points</div>}
              {["PENDING", "ASSIGNED"].includes(p.status) && <Button variant="danger" size="sm" icon={X} className="mt-4" onClick={() => cancel(p._id)}>Cancel pickup</Button>}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------------------- admin: assign + monitor ---------------------- */
export function ManagePickups() {
  const toast = useToast()
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const { data, loading, reload } = useAsync(() => pickupApi.all({ ...(status && { status }), ...(type && { wasteType: type }) }).then((r) => r.data), [status, type])
  const drivers = useAsync(() => userApi.drivers().then((r) => r.data))

  const assign = async (id: string) => {
    if (!chosen[id]) return toast("Choose a driver first", "error")
    try {
      await pickupApi.assign(id, chosen[id])
      toast("Driver assigned")
      reload()
    } catch (e) {
      toast(errMsg(e), "error")
    }
  }

  const name = (p: Pickup) => (typeof p.citizen === "string" ? "Citizen" : p.citizen.name)

  return (
    <>
      <PageHeader title="Pickups" subtitle="Assign drivers to requests and follow collections." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-auto" aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="!w-auto" aria-label="Filter by waste type">
          <option value="">All waste types</option>
          {WASTE_TYPES.map((t) => <option key={t} value={t}>{WASTE[t].label}</option>)}
        </Select>
      </div>
      {loading ? <Spinner /> : (data ?? []).length === 0 ? <Empty icon={ClipboardList} title="No pickups match" text="Try clearing the filters." /> : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-leaf-soft text-forest"><tr>{["Citizen", "Waste", "Date", "Status", "Driver"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {data!.map((p) => {
                const open = ["PENDING", "ASSIGNED"].includes(p.status)
                return (
                  <tr key={p._id}>
                    <td className="px-4 py-3"><div className="font-semibold text-forest">{name(p)}</div><div className="max-w-52 truncate text-xs text-muted">{p.address}</div></td>
                    <td className="px-4 py-3"><WastePill type={p.wasteType} /><div className="mt-1 text-xs text-muted">{p.status === "COLLECTED" ? p.actualKg : p.estimatedKg} kg</div></td>
                    <td className="px-4 py-3 text-muted">{fmtDate(p.scheduledDate)}</td>
                    <td className="px-4 py-3"><Pill className={STATUS_STYLE[p.status].cls}>{STATUS_STYLE[p.status].label}</Pill></td>
                    <td className="px-4 py-3">
                      {open ? (
                        <div className="flex gap-2">
                          <Select aria-label="Driver" value={chosen[p._id] ?? p.driver?._id ?? ""} onChange={(e) => setChosen({ ...chosen, [p._id]: e.target.value })} className="!w-40 !py-1.5">
                            <option value="">Choose driver</option>
                            {(drivers.data ?? []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                          </Select>
                          <Button size="sm" onClick={() => assign(p._id)}>Assign</Button>
                        </div>
                      ) : <span className="text-muted">{p.driver?.name ?? "-"}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  )
}

/* --------------------------- driver: tasks --------------------------- */
export function DriverTasks() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => pickupApi.tasks().then((r) => r.data))
  const [weighing, setWeighing] = useState<string | null>(null)
  const [kg, setKg] = useState("")

  const start = async (id: string) => {
    try {
      await pickupApi.setStatus(id, "IN_PROGRESS")
      toast("Pickup started")
      reload()
    } catch (e) {
      toast(errMsg(e), "error")
    }
  }
  const finish = async (id: string) => {
    try {
      const res = await pickupApi.setStatus(id, "COLLECTED", Number(kg))
      toast(`Collected. Citizen earned ${res.data.pointsAwarded} points.`)
      setWeighing(null)
      setKg("")
      reload()
    } catch (e) {
      toast(errMsg(e), "error")
    }
  }

  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="My tasks" subtitle="Pickups assigned to you, soonest first." action={<Link to="/route" className="rounded-xl bg-sun px-4 py-2.5 text-sm font-semibold text-forest hover:bg-sun-deep">Plan my route</Link>} />
      {(data ?? []).length === 0 ? <Empty icon={CheckCircle2} title="You're all caught up" text="New assignments from the admin will appear here." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data!.map((p) => (
            <Card key={p._id} className="p-5">
              <div className="flex items-start justify-between"><WastePill type={p.wasteType} /><Pill className={STATUS_STYLE[p.status].cls}>{STATUS_STYLE[p.status].label}</Pill></div>
              <div className="mt-3 text-sm font-semibold text-forest">{typeof p.citizen === "string" ? "Citizen" : p.citizen.name}</div>
              <div className="mt-1 flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 size-4 shrink-0 text-leaf" />{p.address}</div>
              <div className="mt-1 text-sm text-muted">{fmtDate(p.scheduledDate, { weekday: "short", day: "numeric", month: "short" })} · ~{p.estimatedKg} kg</div>
              {p.notes && <p className="mt-2 rounded-lg bg-sun-soft px-3 py-2 text-sm text-[#6b5200]">{p.notes}</p>}
              <div className="mt-4">
                {p.status === "ASSIGNED" && <Button icon={Play} onClick={() => start(p._id)}>Start pickup</Button>}
                {p.status === "IN_PROGRESS" && (weighing === p._id ? (
                  <div className="flex gap-2">
                    <Input type="number" min="0.1" step="0.1" autoFocus placeholder="Weight (kg)" value={kg} onChange={(e) => setKg(e.target.value)} className="!w-36" />
                    <Button variant="sun" icon={Check} onClick={() => finish(p._id)}>Confirm</Button>
                    <Button variant="ghost" onClick={() => setWeighing(null)}>Back</Button>
                  </div>
                ) : <Button variant="sun" icon={CheckCircle2} onClick={() => setWeighing(p._id)}>Mark collected</Button>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
