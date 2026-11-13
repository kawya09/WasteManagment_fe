import { Award, Lock, Medal } from "lucide-react"
import { Card, PageHeader, Ring, Spinner } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import { useAsync } from "../hooks/useAsync"
import { LEVEL_STEPS } from "../lib/levels"
import { statsApi, userApi } from "../service"

export default function Rewards() {
  const { user } = useAuth()
  const me = useAsync(() => statsApi.me().then((r) => r.data))
  const board = useAsync(() => userApi.leaderboard().then((r) => r.data))
  if (me.loading || board.loading || !me.data) return <Spinner />
  const s = me.data

  return (
    <>
      <PageHeader title="Eco rewards" subtitle="Earn points for every kilo collected and every report resolved. Sorted waste is worth more." />
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card leaf className="flex items-center gap-5 bg-forest p-6 text-white">
          <Ring value={s.level.progress} size={120} stroke={12}>
            <div><div className="font-display text-3xl font-extrabold text-sun">{s.ecoPoints}</div><div className="text-xs text-white/70">points</div></div>
          </Ring>
          <div>
            <div className="text-sm text-white/70">Current level</div>
            <div className="font-display text-3xl font-extrabold">{s.level.name}</div>
            <div className="mt-1 text-sm text-white/70">{s.level.nextName ? `${(s.level.nextAt ?? 0) - s.ecoPoints} to ${s.level.nextName}` : "Top level reached"}</div>
            <div className="mt-2 text-sm">Rank <b className="text-sun">#{s.rank}</b></div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-forest">Levels</h2>
          <ol className="flex items-center justify-between gap-1">
            {LEVEL_STEPS.map((l, i) => (
              <li key={l.name} className="flex flex-1 flex-col items-center gap-1 text-center">
                <span className={`grid size-9 place-items-center rounded-full text-sm font-bold ${i <= s.level.index ? "bg-sun text-forest" : "bg-[#e9efe9] text-muted"}`}>{i + 1}</span>
                <span className="text-xs font-semibold text-forest">{l.name}</span>
                <span className="text-[11px] text-muted">{l.min}+</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted">Points per kg: recyclable 10 · e-waste 15 · hazardous 12 · organic 6 · bulky 4 · general 2. Every pickup adds 5 bonus points.</p>
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-bold text-forest">Badges</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {s.badges.map((b) => (
          <Card key={b.id} className="flex gap-3 border-sun bg-sun-soft/60 p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sun text-forest"><Award className="size-5" /></span>
            <div><div className="font-bold text-forest">{b.name}</div><div className="text-xs text-[#6b5200]">{b.description}</div></div>
          </Card>
        ))}
        {s.lockedBadges.map((b) => (
          <Card key={b.id} className="flex gap-3 p-4 opacity-70">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e9efe9] text-muted"><Lock className="size-5" /></span>
            <div><div className="font-bold text-forest">{b.name}</div><div className="text-xs text-muted">{b.description}</div></div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-bold text-forest">Leaderboard</h2>
      <Card className="overflow-hidden">
        <ol className="divide-y divide-line">
          {(board.data?.top ?? []).map((u, i) => {
            const mine = u.id === user?.id
            return (
              <li key={u.id} className={`flex items-center gap-4 px-4 py-3 ${mine ? "bg-sun-soft" : ""}`}>
                <span className={`grid size-8 place-items-center rounded-full text-sm font-bold ${i === 0 ? "bg-sun text-forest" : "bg-leaf-soft text-leaf-deep"}`}>{i === 0 ? <Medal className="size-4" /> : i + 1}</span>
                <div className="min-w-0 flex-1"><div className="truncate font-semibold text-forest">{u.name}{mine && " (you)"}</div><div className="text-xs text-muted">{u.area} · {u.level} · {u.badges} badges</div></div>
                <div className="font-display text-lg font-extrabold text-forest">{u.ecoPoints}</div>
              </li>
            )
          })}
        </ol>
      </Card>
    </>
  )
}
