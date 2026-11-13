import { Bot, Lightbulb, ScanSearch, Search } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Button, Card, ErrorNote, Input, PageHeader, Pill } from "../components/ui"
import { errMsg, WASTE } from "../lib/waste"
import { aiApi } from "../service"
import type { Classification } from "../types"

const EXAMPLES = ["plastic bottle", "old phone charger", "banana peel", "paint tin", "broken sofa", "greasy pizza box"]
const BIN_HEX: Record<string, string> = { blue: "#2b7fd0", green: "#1e9e5a", grey: "#64748b", red: "#dc4b3e", yellow: "#e5a800", orange: "#e07a2f" }

export default function Assistant() {
  const [q, setQ] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<Classification | null>(null)
  const [history, setHistory] = useState<Classification[]>([])

  const ask = async (item: string) => {
    if (item.trim().length < 2) return
    setBusy(true)
    setError("")
    try {
      const { data } = await aiApi.classify(item)
      setResult(data)
      setHistory((h) => [data, ...h.filter((x) => x.item !== data.item)].slice(0, 6))
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setBusy(false)
    }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    ask(q)
  }

  const w = result && WASTE[result.category]

  return (
    <>
      <PageHeader title="Sorting assistant" subtitle="Not sure which bin something goes in? Type the item and get an instant answer." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <form onSubmit={submit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input className="!pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. used batteries, glass jar, garden leaves" aria-label="Item to sort" />
              </div>
              <Button type="submit" variant="sun" loading={busy} icon={ScanSearch}>Sort it</Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((x) => <button key={x} onClick={() => { setQ(x); ask(x) }} className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-forest hover:bg-leaf-soft">{x}</button>)}
            </div>
          </Card>

          <ErrorNote message={error} />

          {result && w && (
            <Card leaf className="overflow-hidden">
              <div className="flex items-center gap-4 p-5" style={{ background: w.soft }}>
                <span className="grid size-14 place-items-center rounded-2xl text-white" style={{ background: w.color }}><w.icon className="size-7" /></span>
                <div>
                  <div className="text-sm text-muted">"{result.item}" goes in</div>
                  <div className="font-display text-2xl font-extrabold" style={{ color: w.color }}>{w.label}</div>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <i className="size-6 rounded-md" style={{ background: BIN_HEX[result.binColor] ?? "#64748b" }} />
                  <span className="font-semibold text-forest">{result.binLabel}</span>
                </div>
                {result.tips.length > 0 && (
                  <ul className="space-y-2">
                    {result.tips.map((t) => <li key={t} className="flex gap-2 text-sm"><Lightbulb className="mt-0.5 size-4 shrink-0 text-sun-deep" />{t}</li>)}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Pill className="bg-leaf-soft text-leaf-deep"><Bot className="size-3" />{result.source === "ai" ? "AI answer" : "Built-in rules"}</Pill>
                  <Pill className="bg-sun-soft text-[#8a6500]">{Math.round(result.confidence * 100)}% sure</Pill>
                  {["BULKY", "E_WASTE", "HAZARDOUS"].includes(result.category) && <Link to="/pickups/new" className="ml-auto font-semibold text-leaf-deep underline">Book a pickup</Link>}
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-lg font-bold text-forest">Recently sorted</h2>
          {history.length === 0 ? <p className="text-sm text-muted">Items you check will be listed here.</p> : (
            <ul className="divide-y divide-line">
              {history.map((h) => (
                <li key={h.item} className="flex items-center justify-between py-2.5 text-sm">
                  <button onClick={() => { setQ(h.item); setResult(h) }} className="text-left font-medium text-forest hover:underline">{h.item}</button>
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: WASTE[h.category].soft, color: WASTE[h.category].color }}>{WASTE[h.category].label}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
