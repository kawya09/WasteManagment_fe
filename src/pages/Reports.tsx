import { MapPin, Megaphone, Send } from "lucide-react"
import { useState, type FormEvent } from "react"
import { LocationPicker } from "../components/Map"
import { useToast } from "../components/Toast"
import { Button, Card, Empty, ErrorNote, Field, Input, PageHeader, Pill, Select, Spinner, Textarea } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import { useAsync } from "../hooks/useAsync"
import { errMsg, fmtDate } from "../lib/waste"
import { reportApi } from "../service"
import type { LatLng, Report } from "../types"

const STATUS: Record<Report["status"], string> = {
  OPEN: "bg-sun-soft text-[#8a6500]",
  INVESTIGATING: "bg-[#e1eefb] text-[#1d5f9f]",
  RESOLVED: "bg-leaf text-white",
  REJECTED: "bg-[#eceeed] text-muted"
}
const SEVERITY: Record<Report["severity"], string> = { LOW: "bg-leaf-soft text-leaf-deep", MEDIUM: "bg-sun-soft text-[#8a6500]", HIGH: "bg-[#fde8e5] text-alert" }

export default function Reports() {
  const { user, reload: reloadUser } = useAuth()
  const isAdmin = !!user?.roles.includes("ADMIN")
  return isAdmin ? <AdminReports /> : <CitizenReports onSent={reloadUser} />
}

function CitizenReports({ onSent }: { onSent: () => void }) {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => reportApi.mine().then((r) => r.data))
  const [f, setF] = useState({ title: "", description: "", address: "", severity: "MEDIUM" })
  const [loc, setLoc] = useState<LatLng | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await reportApi.create({ ...f, location: loc })
      toast(res.newBadges?.length ? `${res.message} New badge: ${res.newBadges[0].name}` : res.message)
      setF({ title: "", description: "", address: "", severity: "MEDIUM" })
      setLoc(null)
      reload()
      onSent()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Report illegal dumping" subtitle="Spotted waste where it shouldn't be? Tell us and earn eco points. You get a bonus when it's resolved." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <ErrorNote message={error} />
            <Field label="What did you see?"><Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Old sofa left on the pavement" /></Field>
            <Field label="Address or landmark"><Input required value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
            <Field label="How serious is it?">
              <Select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>
                <option value="LOW">Low - small amount</option><option value="MEDIUM">Medium - blocks a path</option><option value="HIGH">High - hazardous or large</option>
              </Select>
            </Field>
            <Field label="Details"><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
            <Field label="Pin the spot" hint={loc ? `${loc.lat}, ${loc.lng}` : "Optional - tap the map"}><LocationPicker value={loc} onChange={setLoc} height={200} /></Field>
            <Button type="submit" variant="sun" icon={Send} loading={busy} className="w-full">Send report</Button>
          </form>
        </Card>
        <div>
          <h2 className="mb-3 text-lg font-bold text-forest">Your reports</h2>
          {loading ? <Spinner /> : (data ?? []).length === 0 ? <Empty icon={Megaphone} title="No reports yet" text="Reports you send will be tracked here." /> : (
            <div className="space-y-3">
              {data!.map((r) => (
                <Card key={r._id} className="p-4">
                  <div className="flex items-start justify-between gap-2"><div className="font-semibold text-forest">{r.title}</div><Pill className={STATUS[r.status]}>{r.status.toLowerCase()}</Pill></div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5" />{r.address} · {fmtDate(r.createdAt)}</div>
                  {r.adminNote && <p className="mt-2 rounded-lg bg-leaf-soft px-3 py-2 text-sm text-leaf-deep">Team note: {r.adminNote}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function AdminReports() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => reportApi.all().then((r) => r.data))
  const [notes, setNotes] = useState<Record<string, string>>({})

  const update = async (id: string, body: { status?: string; adminNote?: string }) => {
    try {
      await reportApi.update(id, body)
      toast("Report updated")
      reload()
    } catch (e) {
      toast(errMsg(e), "error")
    }
  }

  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Dumping reports" subtitle="Review citizen reports and update their status. Resolving one rewards the reporter." />
      {(data ?? []).length === 0 ? <Empty icon={Megaphone} title="No reports" text="Citizen reports will appear here." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data!.map((r) => (
            <Card key={r._id} className="p-5">
              <div className="flex items-start justify-between gap-2"><div className="font-bold text-forest">{r.title}</div><Pill className={SEVERITY[r.severity]}>{r.severity.toLowerCase()}</Pill></div>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5" />{r.address}</div>
              <div className="text-xs text-muted">By {typeof r.reporter === "object" ? r.reporter?.name : "citizen"} · {fmtDate(r.createdAt)}</div>
              {r.description && <p className="mt-2 text-sm">{r.description}</p>}
              <div className="mt-4 flex gap-2">
                <Select aria-label="Status" value={r.status} onChange={(e) => update(r._id, { status: e.target.value })} className="!w-44">
                  {Object.keys(STATUS).map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </Select>
              </div>
              <div className="mt-2 flex gap-2">
                <Input placeholder="Note for the reporter" value={notes[r._id] ?? r.adminNote} onChange={(e) => setNotes({ ...notes, [r._id]: e.target.value })} />
                <Button variant="ghost" onClick={() => update(r._id, { adminNote: notes[r._id] ?? r.adminNote })}>Save</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
