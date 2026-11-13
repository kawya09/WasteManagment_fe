import { MapPin, Plus, RefreshCw, Trash2, Wifi } from "lucide-react"
import { useMemo, useState } from "react"
import { LocationPicker, MapView } from "../components/Map"
import { useToast } from "../components/Toast"
import { Button, Card, Empty, ErrorNote, Field, FillBar, Input, Modal, PageHeader, Select, Spinner, WastePill } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import { useAsync } from "../hooks/useAsync"
import { binColor, errMsg, WASTE, WASTE_TYPES } from "../lib/waste"
import { binApi } from "../service"
import type { Bin, LatLng, WasteType } from "../types"

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`
}

export default function Bins() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = !!user?.roles.includes("ADMIN")
  const canEmpty = isAdmin || !!user?.roles.includes("DRIVER")
  const { data, loading, reload } = useAsync(() => binApi.list().then((r) => r.data))
  const [filter, setFilter] = useState<"all" | "attention">("all")
  const [focus, setFocus] = useState<LatLng | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)

  const bins = useMemo(() => (data ?? []).filter((b) => filter === "all" || b.fillLevel >= 70), [data, filter])

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      setBusy(true)
      await fn()
      toast(ok)
      await reload()
    } catch (e) {
      toast(errMsg(e), "error")
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader
        title="Smart bins"
        subtitle="Live fill levels from bin sensors. Bins turn yellow at 65% and red at 85%."
        action={isAdmin && (
          <div className="flex gap-2">
            <Button variant="ghost" icon={Wifi} loading={busy} onClick={() => act(binApi.simulate, "Sensor readings updated")}>Simulate sensors</Button>
            <Button icon={Plus} onClick={() => setAdding(true)}>Add bin</Button>
          </div>
        )}
      />
      <div className="mb-4 inline-flex rounded-xl bg-white p-1 ring-1 ring-line">
        {([["all", `All bins (${data?.length ?? 0})`], ["attention", "Needs emptying"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${filter === k ? "bg-forest text-white" : "text-muted"}`}>{l}</button>
        ))}
      </div>

      {bins.length === 0 ? <Empty icon={Trash2} title="No bins to show" text={filter === "attention" ? "Every bin is under 70% full." : "Add your first bin to see it on the map."} /> : (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <MapView
            height={560}
            focus={focus}
            markers={bins.map((b) => ({
              id: b._id, lat: b.location.lat, lng: b.location.lng, color: binColor(b.status), label: b.fillLevel,
              popup: <div><b>{b.name}</b><br />{b.fillLevel}% full · {WASTE[b.wasteType].label}<br />Updated {ago(b.lastReadingAt)}</div>
            }))}
          />
          <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {bins.map((b: Bin) => (
              <Card key={b._id} className={`cursor-pointer p-4 transition-shadow ${selected === b._id ? "ring-2 ring-sun" : ""}`}>
                <div onClick={() => { setSelected(b._id); setFocus({ ...b.location }) }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-forest">{b.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted"><MapPin className="size-3" />{b.code} · {b.area}</div>
                    </div>
                    <span className="font-display text-xl font-extrabold" style={{ color: binColor(b.status) }}>{b.fillLevel}%</span>
                  </div>
                  <div className="mt-3"><FillBar value={b.fillLevel} color={binColor(b.status)} /></div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted"><WastePill type={b.wasteType} /><span>Updated {ago(b.lastReadingAt)}</span></div>
                </div>
                {(canEmpty || isAdmin) && (
                  <div className="mt-3 flex gap-2">
                    {canEmpty && <Button size="sm" variant="ghost" icon={RefreshCw} disabled={busy} onClick={() => act(() => binApi.empty(b._id), `${b.name} emptied`)}>Mark emptied</Button>}
                    {isAdmin && <Button size="sm" variant="danger" icon={Trash2} disabled={busy} onClick={() => confirm(`Remove ${b.name}?`) && act(() => binApi.remove(b._id), "Bin removed")}>Remove</Button>}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <AddBin open={adding} onClose={() => setAdding(false)} onDone={() => { setAdding(false); reload() }} />
    </>
  )
}

function AddBin({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const [f, setF] = useState({ code: "", name: "", area: "Central", wasteType: "GENERAL" as WasteType, capacityL: "240" })
  const [loc, setLoc] = useState<LatLng | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError("")
    try {
      await binApi.create({ ...f, capacityL: Number(f.capacityL), location: loc })
      toast("Bin added")
      setF({ ...f, code: "", name: "" })
      setLoc(null)
      onDone()
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a smart bin">
      <div className="space-y-4">
        <ErrorNote message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bin code"><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="BIN-015" /></Field>
          <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Market Gate" /></Field>
          <Field label="Area"><Select value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })}>{["Central", "Riverside", "Hilltop", "Lakeside"].map((a) => <option key={a}>{a}</option>)}</Select></Field>
          <Field label="Waste type"><Select value={f.wasteType} onChange={(e) => setF({ ...f, wasteType: e.target.value as WasteType })}>{WASTE_TYPES.map((t) => <option key={t} value={t}>{WASTE[t].label}</option>)}</Select></Field>
        </div>
        <Field label="Location" hint={loc ? `${loc.lat}, ${loc.lng}` : "Tap the map to place the bin"}><LocationPicker value={loc} onChange={setLoc} height={200} /></Field>
        <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit}>Add bin</Button></div>
      </div>
    </Modal>
  )
}
