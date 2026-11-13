import { ArrowRight, Leaf, MapPin, Recycle, Trophy } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Logo } from "../components/Layout"
import { Button, ErrorNote, Field, Input, Select } from "../components/ui"
import { useToast } from "../components/Toast"
import { useAuth } from "../hooks/useAuth"
import { errMsg } from "../lib/waste"
import { authApi } from "../service"

/* The one memorable moment: a bin that fills itself on load. */
function BinArt() {
  return (
    <svg viewBox="0 0 220 260" className="w-52 sm:w-60" aria-hidden>
      <defs>
        <clipPath id="binBody"><path d="M44 70h132l-12 150a14 14 0 0 1-14 13H70a14 14 0 0 1-14-13L44 70Z" /></clipPath>
      </defs>
      <path d="M44 70h132l-12 150a14 14 0 0 1-14 13H70a14 14 0 0 1-14-13L44 70Z" fill="#115740" />
      <g clipPath="url(#binBody)">
        <rect className="bin-fill" x="30" y="120" width="160" height="125" fill="#ffc72c" />
        <path className="bin-fill" d="M30 120q20-14 40 0t40 0t40 0t40 0V135H30Z" fill="#ffd95e" />
      </g>
      <path d="M36 70h148" stroke="#1e9e5a" strokeWidth="10" strokeLinecap="round" />
      <path d="M88 70V56a8 8 0 0 1 8-8h28a8 8 0 0 1 8 8v14" stroke="#1e9e5a" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M110 150v46M92 170l18-22 18 22" stroke="#0b3d2e" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function Shell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-forest p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-forest-2" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-forest-2/70" />
        <div className="relative"><Logo /></div>
        <div className="relative">
          <BinArt />
          <h2 className="mt-8 max-w-md text-4xl font-extrabold leading-tight">Cleaner streets start with a smarter bin.</h2>
          <ul className="mt-6 space-y-3 text-white/80">
            {[[MapPin, "Live bin levels and optimised collection routes"], [Recycle, "Book pickups and sort waste with the AI assistant"], [Trophy, "Earn eco points, badges and a place on the leaderboard"]].map(([Icon, text], i) => {
              const I = Icon as typeof Leaf
              return (
                <li key={i} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-sun/20 text-sun"><I className="size-4" /></span>{text as string}</li>
              )
            })}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">EcoCollect waste management</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo light={false} /></div>
          <h1 className="text-3xl font-extrabold text-forest">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted">{subtitle}</p>
          {children}
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </section>
    </div>
  )
}

export function Login() {
  const { user, signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  if (user) return <Navigate to="/" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await signIn(email, password)
      nav("/", { replace: true })
    } catch (err) {
      setError(errMsg(err, "Could not sign in. Check your connection and try again."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell title="Welcome back" subtitle="Sign in to manage pickups, bins and rewards." footer={<>New here? <Link to="/register" className="font-semibold text-leaf-deep underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote message={error} />
        <Field label="Email"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
        <Field label="Password"><Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /></Field>
        <Button type="submit" variant="sun" loading={busy} className="w-full">Sign in <ArrowRight className="size-4" /></Button>
      </form>
    </Shell>
  )
}

export function Register() {
  const nav = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: "", email: "", password: "", area: "Central" })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await authApi.register(form)
      toast("Account created. Sign in to continue.")
      nav("/login")
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell title="Join EcoCollect" subtitle="Create a free account and start earning eco points." footer={<>Already registered? <Link to="/login" className="font-semibold text-leaf-deep underline">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote message={error} />
        <Field label="Full name"><Input required value={form.name} onChange={set("name")} autoComplete="name" /></Field>
        <Field label="Email"><Input type="email" required value={form.email} onChange={set("email")} autoComplete="email" /></Field>
        <Field label="Password" hint="At least 6 characters"><Input type="password" required minLength={6} value={form.password} onChange={set("password")} autoComplete="new-password" /></Field>
        <Field label="Your collection area"><Select value={form.area} onChange={set("area")}>{["Central", "Riverside", "Hilltop", "Lakeside"].map((a) => <option key={a}>{a}</option>)}</Select></Field>
        <Button type="submit" variant="sun" loading={busy} className="w-full">Create account</Button>
      </form>
    </Shell>
  )
}
