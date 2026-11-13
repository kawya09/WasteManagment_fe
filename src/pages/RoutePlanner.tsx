import { Clock, LocateFixed, Route, Ruler, TrendingDown } from "lucide-react"
import { useState } from "react"
import { MapView, useMyLocation } from "../components/Map"
import { useToast } from "../components/Toast"
import { Button, Card, Empty, PageHeader, Spinner, Stat } from "../components/ui"
import { useAsync } from "../hooks/useAsync"
import { routeApi } from "../service"
import type { LatLng } from "../types"

export default function RoutePlanner() {
  const toast = useToast()
  const locate = useMyLocation()
  const [start, setStart] = useState<LatLng | undefined>()
  const { data, loading, reload } = useAsync(() => routeApi.optimise(start).then((r) => r.data), [start])

  if (loading && !data) return <Spinner label="Optimising route" />
  const plan = data

  return (
    <>
      <PageHeader
        title="Route planner"
        subtitle="Stops are ordered to cut driving distance. It combines your assigned pickups with bins that are 70% full or more."
        action={
          <div className="flex gap-2">
            <Button variant="ghost" icon={LocateFixed} onClick={() => locate(setStart, () => toast("Couldn't read your location. Using the depot instead.", "error"))}>Start from my location</Button>
            <Button variant="ghost" onClick={reload}>Refresh</Button>
          </div>
        }
      />
      {!plan || plan.route.length === 0 ? (
        <Empty icon={Route} title="No stops to plan" text="Assigned pickups with a map pin and bins above 70% will show up here." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat icon={Ruler} label="Optimised distance" value={`${plan.totalKm} km`} />
            <Stat icon={TrendingDown} tone="sun" label="Saved vs. unplanned" value={`${plan.savedPercent}%`} hint={`${plan.unoptimisedKm} km without planning`} />
            <Stat icon={Clock} label="Estimated time" value={`${Math.floor(plan.estimatedMinutes / 60)}h ${plan.estimatedMinutes % 60}m`} hint="25 km/h average + 6 min per stop" />
            <Stat icon={Route} tone="forest" label="Stops" value={plan.route.length} />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <MapView
              height={520}
              start={plan.start}
              line={[plan.start, ...plan.route.map((s) => ({ lat: s.lat, lng: s.lng }))]}
              markers={plan.route.map((s) => ({
                id: s.id, lat: s.lat, lng: s.lng, label: s.order, color: s.kind === "bin" ? "#e5a800" : "#1e9e5a",
                popup: <div><b>{s.label}</b><br />{s.detail}</div>
              }))}
            />
            <Card className="max-h-[520px] overflow-y-auto p-2">
              <ol>
                {plan.route.map((s) => (
                  <li key={s.id} className="flex gap-3 rounded-xl p-3 hover:bg-leaf-soft">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${s.kind === "bin" ? "bg-sun text-forest" : "bg-leaf text-white"}`}>{s.order}</span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-forest">{s.label}</div>
                      <div className="truncate text-xs text-muted">{s.detail}</div>
                      <div className="mt-0.5 text-xs text-muted">{s.legKm} km leg · arrive in ~{s.etaMin} min · {s.kind === "bin" ? "empty bin" : "pickup"}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
          {plan.skippedWithoutLocation > 0 && <p className="mt-4 text-sm text-muted">{plan.skippedWithoutLocation} pickup(s) have no map pin, so they aren't in this route.</p>}
        </>
      )}
    </>
  )
}
