import { LocateFixed, Sparkles } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { LocationPicker, useMyLocation } from "../components/Map"
import { useToast } from "../components/Toast"
import { Button, Card, ErrorNote, Field, Input, PageHeader, Textarea } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import { errMsg, todayInput, WASTE, WASTE_TYPES } from "../lib/waste"
import { pickupApi } from "../service"
import type { LatLng, WasteType } from "../types"

export default function RequestPickup() {
  const { user } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const locate = useMyLocation()
  const [type, setType] = useState<WasteType>("RECYCLABLE")
  const [kg, setKg] = useState(10)
  const [date, setDate] = useState(todayInput())
  const [address, setAddress] = useState(user?.address ?? "")
  const [notes, setNotes] = useState("")
  const [loc, setLoc] = useState<LatLng | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const points = Math.round(kg * WASTE[type].pointsPerKg) + 5

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await pickupApi.create({ wasteType: type, estimatedKg: kg, address, location: loc, scheduledDate: date, notes })
      toast("Pickup requested. We'll assign a driver soon.")
      nav("/pickups")
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Request a pickup" subtitle="Tell us what you're putting out and where. Sorted waste earns more eco points." />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-bold text-forest">What kind of waste?</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {WASTE_TYPES.map((t) => {
                const w = WASTE[t]
                const on = t === type
                return (
                  <button type="button" key={t} aria-pressed={on} onClick={() => setType(t)} className={`rounded-xl border-2 p-3 text-left transition-colors ${on ? "border-leaf bg-leaf-soft" : "border-line bg-white hover:border-leaf/50"}`}>
                    <span className="mb-2 grid size-9 place-items-center rounded-lg" style={{ background: w.soft, color: w.color }}><w.icon className="size-5" /></span>
                    <div className="text-sm font-bold text-forest">{w.label}</div>
                    <div className="text-xs text-muted">{w.hint}</div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <Field label={`Estimated weight: ${kg} kg`}>
              <input type="range" min={1} max={100} value={kg} onChange={(e) => setKg(+e.target.value)} className="w-full accent-[#1e9e5a]" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pickup date"><Input type="date" min={todayInput()} required value={date} onChange={(e) => setDate(e.target.value)} /></Field>
              <Field label="Address"><Input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House number and street" /></Field>
            </div>
            <Field label="Notes for the driver" hint="Optional - gate code, where the bags are, anything unusual"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-forest">Pin your location</h2>
              <Button type="button" variant="ghost" size="sm" icon={LocateFixed} onClick={() => locate(setLoc, () => toast("Couldn't read your location. Tap the map instead.", "error"))}>Use mine</Button>
            </div>
            <LocationPicker value={loc} onChange={setLoc} />
            <p className="text-xs text-muted">{loc ? `Pinned at ${loc.lat}, ${loc.lng}` : "Tap the map to drop a pin. It helps drivers plan the shortest route."}</p>
          </Card>

          <Card leaf className="bg-sun-soft p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-sun text-forest"><Sparkles className="size-5" /></span>
              <div>
                <div className="font-display text-2xl font-extrabold text-forest">~{points} points</div>
                <div className="text-sm text-[#6b5200]">You'll earn this once it's collected</div>
              </div>
            </div>
          </Card>

          <ErrorNote message={error} />
          <Button type="submit" variant="sun" loading={busy} className="w-full py-3">Request pickup</Button>
        </div>
      </form>
    </>
  )
}
