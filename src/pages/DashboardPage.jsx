import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Sparkline from "../components/Sparkline"
import AreaChart from "../components/AreaChart"

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("7d")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [activityFilter, setActivityFilter] = useState("All")

  const kpiByRange = useMemo(
    () => ({
      "7d": [
        { label: "Active Users", value: 12480, delta: 4.1 },
        { label: "Conversions", value: 1206, delta: 1.8 },
        { label: "MRR", value: 32400, delta: 3.2, isCurrency: true },
        { label: "Churn", value: 2.3, delta: -0.4, isPercent: true },
      ],
      "30d": [
        { label: "Active Users", value: 48210, delta: 6.3 },
        { label: "Conversions", value: 4380, delta: 2.1 },
        { label: "MRR", value: 126800, delta: 4.4, isCurrency: true },
        { label: "Churn", value: 2.1, delta: -0.6, isPercent: true },
      ],
      "90d": [
        { label: "Active Users", value: 139420, delta: 9.8 },
        { label: "Conversions", value: 13120, delta: 3.6 },
        { label: "MRR", value: 366200, delta: 7.2, isCurrency: true },
        { label: "Churn", value: 2.0, delta: -0.9, isPercent: true },
      ],
    }),
    [],
  )

  const [kpis, setKpis] = useState(kpiByRange[timeframe])

  useEffect(() => {
    setKpis(kpiByRange[timeframe])
  }, [timeframe, kpiByRange])

  function formatValue(kpi) {
    if (kpi.isCurrency) return `$${Intl.NumberFormat().format(kpi.value)}`
    if (kpi.isPercent) return `${kpi.value}%`
    return Intl.NumberFormat().format(kpi.value)
  }

  function formatDelta(delta) {
    const sign = delta > 0 ? "+" : ""
    return `${sign}${delta}%`
  }

  function refreshData() {
    setIsRefreshing(true)
    // Simulate a brief refresh and slight value changes
    setTimeout(() => {
      setKpis((prev) =>
        prev.map((k) => {
          const variance = k.isPercent ? 0.1 : k.isCurrency ? 200 : 50
          const jitter = (Math.random() - 0.5) * 2 * variance
          const deltaJitter = (Math.random() - 0.5) * 1.0
          return {
            ...k,
            value: Math.max(0, Math.round((k.value + jitter) * (k.isCurrency ? 1 : 1))),
            delta: Math.round((k.delta + deltaJitter) * 10) / 10,
          }
        }),
      )
      setIsRefreshing(false)
    }, 700)
  }

  const allActivity = useMemo(
    () => [
      { t: "New signup", d: "Alex joined your workspace", time: "2m ago", cat: "Signups" },
      { t: "Payment received", d: "$420 from ACME Inc.", time: "12m ago", cat: "Payments" },
      { t: "Deployment", d: "v1.4.2 completed", time: "1h ago", cat: "Deployments" },
      { t: "Support", d: "Ticket #3921 resolved", time: "3h ago", cat: "Support" },
      { t: "New signup", d: "Sam invited 3 teammates", time: "4h ago", cat: "Signups" },
      { t: "Payment received", d: "$1,240 from Globex", time: "6h ago", cat: "Payments" },
    ],
    [],
  )

  const filteredActivity = useMemo(() => {
    const list = activityFilter === "All" ? allActivity : allActivity.filter((a) => a.cat === activityFilter)
    return showAllActivity ? list : list.slice(0, 4)
  }, [activityFilter, allActivity, showAllActivity])

  return (
    <main className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-gradient">Dashboard</h1>
            <p className="text-gray-400 mt-2">Overview of your product metrics and quick actions</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
              {["7d", "30d", "90d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeframe(r)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    timeframe === r ? "bg-purple-600/30 text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button onClick={refreshData} className="btn-ghost flex items-center gap-2">
              {isRefreshing && (
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              Refresh
            </button>
            <Link to="/services" className="btn-ghost">Explore Services</Link>
            <Link to="/contact" className="btn-gradient">Contact Sales</Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI Cards */}
          {kpis.map((kpi, idx) => (
            <div key={kpi.label} className={`card-glass p-6 transition-all ${isRefreshing ? "opacity-70" : "hover:scale-[1.01]"}`}>
              <div className="text-gray-400 text-sm flex items-center justify-between">
                <span>{kpi.label}</span>
                <span className={`text-xs ${kpi.delta >= 0 ? "text-green-400" : "text-red-400"}`}>{formatDelta(kpi.delta)}</span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-3xl font-semibold text-white">
                  {isRefreshing ? (
                    <span className="inline-block h-7 w-28 rounded bg-white/10 animate-pulse" />
                  ) : (
                    formatValue(kpi)
                  )}
                </div>
                <span className="chip">{formatDelta(kpi.delta)}</span>
              </div>
              <div className="mt-4 -mb-2">
                <Sparkline
                  data={Array.from({ length: 20 }, (_, i) => Math.round((i + 1) * (idx + 1) * 3 + (Math.random() - 0.5) * 10))}
                  width={260}
                  height={56}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="card-glass p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">Activity</h2>
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="bg-black/40 border border-white/10 text-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none"
                >
                  {['All','Payments','Signups','Deployments','Support'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button className="btn-ghost px-4 py-2" onClick={() => setShowAllActivity((s) => !s)}>
                {showAllActivity ? "Collapse" : "View all"}
              </button>
            </div>
            <ul className="mt-4 space-y-4">
              {filteredActivity.map((item, idx) => (
                <li key={`${item.t}-${idx}`} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-medium">{item.t}</div>
                    <div className="text-gray-400 text-sm">{item.d}</div>
                  </div>
                  <span className="text-gray-500 text-sm">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold text-white">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/register" className="btn-gradient text-center">Invite user</Link>
              <Link to="/services" className="btn-ghost text-center">Create project</Link>
              <Link to="/about" className="btn-ghost text-center">View docs</Link>
              <Link to="/contact" className="btn-ghost text-center">Get help</Link>
            </div>
          </div>
        </section>

        {/* Secondary widgets */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold text-white">Usage</h2>
            <p className="text-gray-400 mt-2">Traffic and performance summaries go here.</p>
            <div className="mt-4">
              <AreaChart
                data={Array.from({ length: timeframe === "7d" ? 14 : timeframe === "30d" ? 30 : 45 }, (_, i) =>
                  Math.round(100 + 40 * Math.sin(i / 3) + (Math.random() - 0.5) * 20),
                )}
                width={720}
                height={220}
              />
            </div>
          </div>
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold text-white">Announcements</h2>
            <ul className="mt-3 list-disc list-inside text-gray-300 space-y-1">
              <li>New integration: Stripe Billing</li>
              <li>Improved onboarding flow</li>
              <li>Dark theme refinements</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}


