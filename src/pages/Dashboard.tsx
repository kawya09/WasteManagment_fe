import { AlertTriangle, ArrowRight, CalendarClock, Cloud, Flag, Leaf, MapPin, Megaphone, PackagePlus, Recycle, Route, ScanSearch, Scale, Trash2, Truck, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { primaryRole } from "../components/Layout"
import { BarChart, Card, Donut, Empty, FillBar, PageHeader, Pill, Ring, Spinner, Stat, WastePill } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import { useAsync } from "../hooks/useAsync"
import { binColor, fmtDate, STATUS_STYLE } from "../lib/waste"
import { binApi, pickupApi, statsApi } from "../service"

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return null
  const role = primaryRole(user.roles)
  return role === "ADMIN" ? <AdminView /> : role === "DRIVER" ? <DriverView name={user.name} /> : <CitizenView name={user.name} />
}

/* ------------------------------ citizen ------------------------------ */
function CitizenView({ name }: { name: string }) {
  const { data, loading } = useAsync(() => statsApi.me().then((r) => r.data))
  if (loading || !data) return <Spinner />
  const { level } = data

  return (
    <>
      <section className="leaf relative mb-6 overflow-hidden bg-forest p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-forest-2" />
        <div className="relative flex flex-wrap items-center gap-6">
          <Ring value={level.progress} size={132} stroke={13}>
            <div>
              <div className="font-display text-3xl font-extrabold text-sun">{data.ecoPoints}</div>
              <div className="text-xs text-white/70">eco points</div>
            </div>
          </Ring>
          <div className="min-w-56 flex-1">
            <p className="text-white/70">Hi {name.split(" ")[0]}, you're a</p>
            <h1 className="font-display text-4xl font-extrabold">{level.name}</h1>
            <p className="mt-1 text-sm text-white/70">
              {level.nextName ? `${(level.nextAt ?? 0) - data.ecoPoints} points to reach ${level.nextName}` : "You've reached the top level. Keep it up!"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/pickups/new" className="inline-flex items-center gap-2 rounded-xl bg-sun px-4 py-2.5 text-sm font-semibold text-forest hover:bg-sun-deep"><PackagePlus className="size-4" /> Request a pickup</Link>
              <Link to="/assistant" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20"><ScanSearch className="size-4" /> Sort an item</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Scale} label="Waste collected" value={`${data.totalKg} kg`} />
        <Stat icon={Cloud} tone="sun" label="CO₂ avoided" value={`${data.co2SavedKg} kg`} hint="Based on what you sorted" />
        <Stat icon={Flag} label="Leaderboard rank" value={`#${data.rank}`} />
        <Stat icon={Leaf} tone="sun" label="Badges earned" value={`${data.badges.length} / ${data.badges.length + data.lockedBadges.length}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-forest">Upcoming pickups</h2>
            <Link to="/pickups" className="text-sm font-semibold text-leaf-deep">View all</Link>
          </div>
          {data.upcoming.length === 0 ? (
            <Empty icon={CalendarClock} title="No pickups booked" text="Book a collection and earn points for every kilo you sort." action={<Link to="/pickups/new" className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white">Request a pickup</Link>} />
          ) : (
            <ul className="divide-y divide-line">
              {data.upcoming.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <WastePill type={p.wasteType} />
                    <div className="mt-1 text-sm text-muted">{fmtDate(p.scheduledDate, { weekday: "short", day: "numeric", month: "short" })} · {p.address}</div>
                  </div>
                  <Pill className={STATUS_STYLE[p.status].cls}>{STATUS_STYLE[p.status].label}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-forest">What you've sorted</h2>
          {data.byType.length === 0 ? <p className="text-sm text-muted">Your sorted waste will show up here after your first collection.</p> : <Donut data={data.byType} />}
        </Card>
      </div>

      {data.badges.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="mb-3 text-lg font-bold text-forest">Your badges</h2>
          <div className="flex flex-wrap gap-2">
            {data.badges.map((b) => <Pill key={b.id} className="bg-sun-soft py-1.5 text-[#8a6500]"><Leaf className="size-3.5" />{b.name}</Pill>)}
          </div>
        </Card>
      )}
    </>
  )
}

/* ------------------------------- driver ------------------------------- */
function DriverView({ name }: { name: string }) {
  const tasks = useAsync(() => pickupApi.tasks().then((r) => r.data))
  const bins = useAsync(() => binApi.list().then((r) => r.data))
  if (tasks.loading || bins.loading) return <Spinner />
  const full = (bins.data ?? []).filter((b) => b.fillLevel >= 70)

  return (
    <>
      <PageHeader title={`Good day, ${name.split(" ")[0]}`} subtitle="Here's what's on your route today." action={<Link to="/route" className="inline-flex items-center gap-2 rounded-xl bg-sun px-4 py-2.5 text-sm font-semibold text-forest hover:bg-sun-deep"><Route className="size-4" /> Open route planner</Link>} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat icon={Truck} label="Assigned pickups" value={tasks.data?.length ?? 0} />
        <Stat icon={Trash2} tone="sun" label="Bins to empty (70%+)" value={full.length} />
        <Stat icon={AlertTriangle} tone="forest" label="Critical bins" value={full.filter((b) => b.status === "CRITICAL").length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-forest">Next pickups</h2><Link to="/tasks" className="text-sm font-semibold text-leaf-deep">All tasks</Link></div>
          {(tasks.data ?? []).length === 0 ? <p className="text-sm text-muted">Nothing assigned right now.</p> : (
            <ul className="divide-y divide-line">
              {tasks.data!.slice(0, 5).map((p) => (
                <li key={p._id} className="py-3"><WastePill type={p.wasteType} /><div className="mt-1 flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 size-4 shrink-0" />{p.address}</div></li>
              ))}
            </ul>
          )}
        </Card>
        <BinsNeedingAttention bins={full.slice(0, 5)} />
      </div>
    </>
  )
}

function BinsNeedingAttention({ bins }: { bins: { _id: string; name: string; area: string; fillLevel: number; status: string }[] }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-forest">Bins needing attention</h2><Link to="/bins" className="text-sm font-semibold text-leaf-deep">Map</Link></div>
      {bins.length === 0 ? <p className="text-sm text-muted">All bins are below 70%. Nice.</p> : (
        <ul className="space-y-4">
          {bins.map((b) => (
            <li key={b._id}>
              <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold text-forest">{b.name} <span className="font-normal text-muted">· {b.area}</span></span><span className="font-bold" style={{ color: binColor(b.status) }}>{b.fillLevel}%</span></div>
              <FillBar value={b.fillLevel} color={binColor(b.status)} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/* -------------------------------- admin -------------------------------- */
function AdminView() {
  const { data, loading, error } = useAsync(() => statsApi.overview().then((r) => r.data))
  if (loading) return <Spinner />
  if (!data) return <p className="text-alert">{error || "No data"}</p>
  const t = data.totals
  const maxArea = Math.max(1, ...data.areas.map((a) => a.kg))

  return (
    <>
      <PageHeader title="Operations overview" subtitle="Collection volumes, recycling performance and bins that need attention." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Scale} tone="forest" label="Waste collected" value={`${t.collectedKg.toLocaleString()} kg`} hint={`${t.pickupsCollected} pickups completed`} />
        <Stat icon={Recycle} label="Diverted from landfill" value={`${t.recyclingRate}%`} hint="Recycled, composted or safely processed" />
        <Stat icon={Cloud} tone="sun" label="CO₂ avoided" value={`${t.co2SavedKg.toLocaleString()} kg`} />
        <Stat icon={Truck} tone="sun" label="Pickups waiting" value={t.pickupsPending} hint={`${t.pickupsActive} in progress`} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-forest">Collected per month</h2>
          <BarChart data={data.monthly} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-forest">Waste by type</h2>
          {data.byType.length ? <Donut data={data.byType} /> : <p className="text-sm text-muted">No collected pickups yet.</p>}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-1 text-lg font-bold text-forest">Bin network</h2>
          <p className="mb-4 text-sm text-muted">{data.bins.total} bins · average fill {data.bins.averageFill}%</p>
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-[#fde8e5] p-3 text-center"><div className="font-display text-2xl font-extrabold text-alert">{data.bins.critical}</div><div className="text-xs text-alert">critical</div></div>
            <div className="flex-1 rounded-xl bg-sun-soft p-3 text-center"><div className="font-display text-2xl font-extrabold text-[#8a6500]">{data.bins.warning}</div><div className="text-xs text-[#8a6500]">filling up</div></div>
          </div>
          <Link to="/bins" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf-deep">Open bin map <ArrowRight className="size-4" /></Link>
        </Card>
        <div className="lg:col-span-2"><BinsNeedingAttention bins={data.bins.needsEmptying} /></div>
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-forest">Top areas by volume</h2>
          <ul className="space-y-3">
            {data.areas.map((a) => (
              <li key={a.area} className="grid grid-cols-[6rem_1fr_4rem] items-center gap-3 text-sm">
                <span className="text-forest">{a.area}</span>
                <div className="h-3 rounded-full bg-[#e9efe9]"><div className="h-full rounded-full bg-sun" style={{ width: `${(a.kg / maxArea) * 100}%` }} /></div>
                <span className="text-right font-semibold text-forest">{a.kg} kg</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-forest">People</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Users className="size-4 text-leaf" /> {t.citizens} citizens</div>
            <div className="flex items-center gap-2"><Truck className="size-4 text-leaf" /> {t.drivers} drivers</div>
            <Link to="/reports" className="flex items-center gap-2 font-semibold text-leaf-deep"><Megaphone className="size-4" /> {t.openReports} open dumping reports</Link>
          </div>
        </Card>
      </div>
    </>
  )
}
