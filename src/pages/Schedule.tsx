import { CalendarDays, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "../components/Toast"
import { Button, Card, Empty, Field, Input, PageHeader, Select, Spinner, WastePill } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import { useAsync } from "../hooks/useAsync"
import { DAYS, errMsg, WASTE, WASTE_TYPES } from "../lib/waste"
import { scheduleApi } from "../service"
import type { WasteType } from "../types"

const AREAS = ["Central", "Riverside", "Hilltop", "Lakeside"]

export default function Schedule() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = !!user?.roles.includes("ADMIN")
  const { data, loading, reload } = useAsync(() => scheduleApi.list().then((r) => r.data))
  const [area, setArea] = useState(user?.area && AREAS.includes(user.area) ? user.area : AREAS[0])
  const [f, setF] = useState({ wasteType: "GENERAL" as WasteType, dayOfWeek: 1, time: "07:00" })

  const add = async () => {
    try {
      await scheduleApi.create({ ...f, area })
      toast("Collection added")
      reload()
    } catch (e) {
      toast(errMsg(e), "error")
    }
  }
  const remove = async (id: string) => {
    await scheduleApi.remove(id)
    toast("Collection removed")
    reload()
  }

  if (loading) return <Spinner />
  const mine = (data ?? []).filter((s) => s.area === area)
  const today = new Date().getDay()

  return (
    <>
      <PageHeader
        title="Collection schedule"
        subtitle="When each waste type is collected in your area."
        action={<Select aria-label="Area" value={area} onChange={(e) => setArea(e.target.value)} className="!w-44">{AREAS.map((a) => <option key={a}>{a}</option>)}</Select>}
      />
      {mine.length === 0 ? <Empty icon={CalendarDays} title={`No collections set for ${area}`} text={isAdmin ? "Add the first one below." : "Check back soon."} /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DAYS.map((d, i) => {
            const items = mine.filter((s) => s.dayOfWeek === i).sort((a, b) => a.time.localeCompare(b.time))
            return (
              <Card key={d} className={`p-4 ${i === today ? "border-sun ring-2 ring-sun" : ""} ${items.length === 0 ? "opacity-60" : ""}`}>
                <div className="mb-2 flex items-center justify-between"><span className="font-bold text-forest">{d}</span>{i === today && <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-bold text-forest">Today</span>}</div>
                {items.length === 0 ? <p className="text-xs text-muted">No collection</p> : (
                  <ul className="space-y-2">
                    {items.map((s) => (
                      <li key={s._id} className="flex items-center justify-between gap-2">
                        <div><WastePill type={s.wasteType} /><div className="mt-0.5 text-xs text-muted">{s.time}</div></div>
                        {isAdmin && <button aria-label="Remove collection" onClick={() => remove(s._id)} className="rounded-lg p-1.5 text-alert hover:bg-[#fde8e5]"><Trash2 className="size-4" /></button>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )
          })}
        </div>
      )}
      {isAdmin && (
        <Card className="mt-6 p-5">
          <h2 className="mb-3 text-lg font-bold text-forest">Add a collection for {area}</h2>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Waste type"><Select value={f.wasteType} onChange={(e) => setF({ ...f, wasteType: e.target.value as WasteType })}>{WASTE_TYPES.map((t) => <option key={t} value={t}>{WASTE[t].label}</option>)}</Select></Field>
            <Field label="Day"><Select value={f.dayOfWeek} onChange={(e) => setF({ ...f, dayOfWeek: +e.target.value })}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</Select></Field>
            <Field label="Time"><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
            <Button icon={Plus} onClick={add}>Add</Button>
          </div>
        </Card>
      )}
    </>
  )
}
