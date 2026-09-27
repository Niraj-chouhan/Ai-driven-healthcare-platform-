"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Shield, Users, Stethoscope, Activity, TrendingUp, IndianRupee,
  CheckCircle2, XCircle, Clock, Search, Bell, LogOut, BarChart3,
  AlertTriangle, FileText, Settings, Eye, Download, Filter,
  ChevronRight, Star, MapPin, Phone, Mail, Wifi, WifiOff,
  UserCheck, UserX, Calendar, RefreshCw, Package, MoreVertical,
  ArrowUp, ArrowDown, Bot, Heart, ChevronDown, PieChart,
  Layers, Zap, Globe, BookOpen, Home, Menu, X
} from "lucide-react"

// ─── MOCK DATA ───────────────────────────────────────────────

const STATS = {
  totalNurses: 142,
  activeNurses: 87,
  totalPatients: 1204,
  activeRequests: 23,
  pendingApprovals: 7,
  totalRevenue: 284500,
  todayRevenue: 18400,
  completedVisits: 3876,
  avgRating: 4.8,
  systemUptime: "99.7%",
}

const NURSES = [
  { id: "NRS-001", name: "Anjali Patel", location: "Jaipur, Rajasthan", experience: "5 years", submittedAt: "2 hours ago", specializations: ["ICU", "Emergency"], documents: { nursingCert: true, idProof: true, cvUploaded: true }, status: "pending", rating: null, earnings: 0, phone: "+91 94512 33211", email: "anjali.patel@gmail.com" },
  { id: "NRS-002", name: "Meera Singh", location: "Delhi NCR", experience: "3 years", submittedAt: "4 hours ago", specializations: ["General"], documents: { nursingCert: true, idProof: true, cvUploaded: false }, status: "pending", rating: null, earnings: 0, phone: "+91 98877 22110", email: "meera.s@gmail.com" },
  { id: "NRS-003", name: "Priya Sharma", location: "Noida, UP", experience: "5 years", submittedAt: "Active", specializations: ["General Care", "Injections"], documents: { nursingCert: true, idProof: true, cvUploaded: true }, status: "approved", rating: 4.9, earnings: 52800, phone: "+91 98765 00001", email: "priya@gmail.com" },
  { id: "NRS-004", name: "Rajesh Kumar", location: "Ghaziabad", experience: "7 years", submittedAt: "Active", specializations: ["Elder Care", "Physiotherapy"], documents: { nursingCert: true, idProof: true, cvUploaded: true }, status: "approved", rating: 4.8, earnings: 78200, phone: "+91 98765 00002", email: "rajesh@gmail.com" },
  { id: "NRS-005", name: "Anita Mehta", location: "Indirapuram", experience: "9 years", submittedAt: "Active", specializations: ["Pediatric", "Neonatal"], documents: { nursingCert: true, idProof: true, cvUploaded: true }, status: "approved", rating: 4.9, earnings: 93400, phone: "+91 98765 00003", email: "anita@gmail.com" },
  { id: "NRS-006", name: "Vikram Nair", location: "Faridabad", experience: "2 years", submittedAt: "1 day ago", specializations: ["General"], documents: { nursingCert: false, idProof: true, cvUploaded: true }, status: "rejected", rating: null, earnings: 0, phone: "+91 90011 44322", email: "vikram.n@gmail.com" },
]

const PATIENTS = [
  { id: "PAT-001", name: "Rahul Sharma", phone: "+91 98001 22334", email: "rahul@gmail.com", location: "Sector 5, Noida", visits: 12, status: "active", joinedAt: "3 months ago", lastVisit: "Today", totalSpent: 4800 },
  { id: "PAT-002", name: "Sunita Verma", phone: "+91 97001 55432", email: "sunita.v@gmail.com", location: "Dwarka, Delhi", visits: 5, status: "active", joinedAt: "1 month ago", lastVisit: "2 days ago", totalSpent: 2100 },
  { id: "PAT-003", name: "Amit Gupta", phone: "+91 96001 22998", email: "amit.g@gmail.com", location: "Gurugram", visits: 28, status: "active", joinedAt: "6 months ago", lastVisit: "Yesterday", totalSpent: 12400 },
  { id: "PAT-004", name: "Kavita Joshi", phone: "+91 95411 00123", email: "kavita@gmail.com", location: "Faridabad", visits: 3, status: "inactive", joinedAt: "2 months ago", lastVisit: "3 weeks ago", totalSpent: 900 },
]

const REQUESTS = [
  { id: "REQ-001", patient: "Rahul Sharma", nurse: "Priya Sharma", mode: "temporary", status: "in-progress", problem: "Wound dressing needed post-surgery", address: "Sector 5, Noida", createdAt: "15 mins ago", amount: 350 },
  { id: "REQ-002", patient: "Sunita Verma", nurse: "Unassigned", mode: "longterm", status: "pending", problem: "Elder care for 78-year-old mother", address: "Dwarka, Delhi", createdAt: "32 mins ago", amount: 0 },
  { id: "REQ-003", patient: "Amit Gupta", nurse: "Rajesh Kumar", mode: "temporary", status: "completed", problem: "Blood glucose monitoring & insulin injection", address: "Gurugram", createdAt: "2 hours ago", amount: 250 },
  { id: "REQ-004", patient: "Priya Singh", nurse: "Anita Mehta", mode: "longterm", status: "matched", problem: "Postnatal care & newborn monitoring", address: "Indirapuram", createdAt: "4 hours ago", amount: 1200 },
]

const ACTIVITY_LOG = [
  { id: 1, type: "nurse_approved", msg: "Priya Sharma approved by Admin", time: "10 mins ago", icon: "✅" },
  { id: 2, type: "request_completed", msg: "REQ-003 completed — ₹250 credited", time: "2 hours ago", icon: "💰" },
  { id: 3, type: "new_nurse", msg: "Meera Singh submitted registration", time: "4 hours ago", icon: "🆕" },
  { id: 4, type: "alert", msg: "Nurse Vikram Nair documents incomplete", time: "1 day ago", icon: "⚠️" },
  { id: 5, type: "patient_joined", msg: "New patient: Kavita Joshi registered", time: "2 days ago", icon: "👤" },
]

const REVENUE_DATA = [
  { day: "Mon", amount: 12400 },
  { day: "Tue", amount: 9800 },
  { day: "Wed", amount: 15200 },
  { day: "Thu", amount: 11600 },
  { day: "Fri", amount: 18400 },
  { day: "Sat", amount: 22100 },
  { day: "Sun", amount: 8300 },
]

// ─── TYPES ───────────────────────────────────────────────────
type Tab = "dashboard" | "nurses" | "patients" | "requests" | "analytics" | "settings"
type NurseFilter = "all" | "pending" | "approved" | "rejected"

// ─── SUB-COMPONENTS ─────────────────────────────────────────

function StatCard({ icon, label, value, sub, trend, color }: {
  icon: React.ReactNode; label: string; value: string | number
  sub?: string; trend?: { val: string; up: boolean }; color: string
}) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
              {trend.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {trend.val}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5 opacity-70">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function NurseStatusBadge({ status }: { status: string }) {
  if (status === "pending") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">⏳ Pending</Badge>
  if (status === "approved") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">✅ Approved</Badge>
  if (status === "rejected") return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">❌ Rejected</Badge>
  return null
}

function RequestStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    matched: "bg-sky-100 text-sky-700 border-sky-200",
    "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  }
  const emoji: Record<string, string> = {
    pending: "⏳", matched: "🔗", "in-progress": "🚀", completed: "✅", cancelled: "❌"
  }
  return <Badge className={`text-xs ${map[status] || ""}`}>{emoji[status]} {status.replace("-", " ")}</Badge>
}

// ─── MINI REVENUE CHART ─────────────────────────────────────
function RevenueBar({ data }: { data: typeof REVENUE_DATA }) {
  const max = Math.max(...data.map(d => d.amount))
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map(d => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-teal-500 opacity-80 transition-all hover:opacity-100"
            style={{ height: `${(d.amount / max) * 72}px` }}
            title={`₹${d.amount.toLocaleString()}`}
          />
          <span className="text-[9px] text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard")
  const [nurseFilter, setNurseFilter] = useState<NurseFilter>("all")
  const [search, setSearch] = useState("")
  const [nurses, setNurses] = useState(NURSES)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(2)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [autoApprove, setAutoApprove] = useState(false)

  // Simulate realtime activity
  const [liveCount, setLiveCount] = useState(STATS.activeRequests)
  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(c => c + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.7 ? 1 : 0))
    }, 5000)
    return () => clearInterval(t)
  }, [])

  function approveNurse(id: string) {
    setNurses(prev => prev.map(n => n.id === id ? { ...n, status: "approved" } : n))
  }
  function rejectNurse(id: string) {
    setNurses(prev => prev.map(n => n.id === id ? { ...n, status: "rejected" } : n))
  }

  const filteredNurses = nurses
    .filter(n => nurseFilter === "all" || n.status === nurseFilter)
    .filter(n => !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.location.toLowerCase().includes(search.toLowerCase()))

  const pendingCount = nurses.filter(n => n.status === "pending").length

  const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { id: "nurses", label: "Nurses", icon: <Stethoscope className="h-4 w-4" />, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "patients", label: "Patients", icon: <Users className="h-4 w-4" /> },
    { id: "requests", label: "Requests", icon: <Activity className="h-4 w-4" />, badge: liveCount > 0 ? liveCount : undefined },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">

      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(o => !o)}>
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <div className="h-8 w-8 rounded-xl bg-teal-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-sm leading-none">SevaSetu</p>
              <p className="text-[10px] text-teal-600 font-semibold">ADMIN PANEL</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === item.id
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 font-medium hidden sm:flex">
              <Wifi className="h-3 w-3" />
              Live
            </div>
            <button className="relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setNotifications(0)}>
              <Bell className="h-5 w-5 text-slate-600" />
              {notifications > 0 && (
                <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 space-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm">Navigation</p>
              <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false) }}
                className={`relative w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  tab === item.id ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.icon} {item.label}
                {item.badge !== undefined && (
                  <Badge className="ml-auto bg-red-100 text-red-700 border-red-200 text-xs">{item.badge}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">

        {/* ═══ DASHBOARD TAB ═══ */}
        {tab === "dashboard" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold">Good Morning, Admin 👋</h1>
              <p className="text-sm text-muted-foreground">Here's what's happening on SevaSetu today</p>
            </div>

            {/* Alert banner */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setTab("nurses")}>
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-sm font-medium text-amber-800">{pendingCount} nurse application{pendingCount > 1 ? "s" : ""} awaiting your review</p>
                <ChevronRight className="h-4 w-4 text-amber-600 ml-auto" />
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Stethoscope className="h-5 w-5 text-teal-600" />} label="Total Nurses" value={STATS.totalNurses} sub={`${STATS.activeNurses} active`} trend={{ val: "+3 this week", up: true }} color="bg-teal-50" />
              <StatCard icon={<Users className="h-5 w-5 text-sky-600" />} label="Total Patients" value={STATS.totalPatients} sub="Registered" trend={{ val: "+12 today", up: true }} color="bg-sky-50" />
              <StatCard icon={<Activity className="h-5 w-5 text-orange-500" />} label="Live Requests" value={liveCount} sub="Right now" trend={{ val: "realtime", up: true }} color="bg-orange-50" />
              <StatCard icon={<IndianRupee className="h-5 w-5 text-emerald-600" />} label="Today's Revenue" value={`₹${STATS.todayRevenue.toLocaleString()}`} sub="Across all visits" trend={{ val: "+18%", up: true }} color="bg-emerald-50" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Clock className="h-5 w-5 text-amber-600" />} label="Pending Approvals" value={pendingCount} sub="Nurse applications" color="bg-amber-50" />
              <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label="Total Visits" value={STATS.completedVisits.toLocaleString()} sub="All time" color="bg-emerald-50" />
              <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Avg Rating" value={STATS.avgRating} sub="Platform-wide" color="bg-yellow-50" />
              <StatCard icon={<Zap className="h-5 w-5 text-purple-600" />} label="Uptime" value={STATS.systemUptime} sub="Last 30 days" color="bg-purple-50" />
            </div>

            {/* Revenue chart + Activity log */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold">Weekly Revenue</CardTitle>
                    <span className="text-xs text-muted-foreground">₹{STATS.totalRevenue.toLocaleString()} total</span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <RevenueBar data={REVENUE_DATA} />
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <span>Highest: ₹22,100 (Sat)</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><ArrowUp className="h-3 w-3" />24% vs last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {ACTIVITY_LOG.map(item => (
                    <div key={item.id} className="flex items-start gap-3 py-1.5 border-b last:border-0">
                      <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-snug">{item.msg}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick actions */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Actions</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Review Nurses", icon: <UserCheck className="h-4 w-4" />, action: () => { setNurseFilter("pending"); setTab("nurses") }, color: "text-amber-600 bg-amber-50 border-amber-200" },
                  { label: "View Requests", icon: <Activity className="h-4 w-4" />, action: () => setTab("requests"), color: "text-sky-600 bg-sky-50 border-sky-200" },
                  { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, action: () => setTab("analytics"), color: "text-purple-600 bg-purple-50 border-purple-200" },
                  { label: "Settings", icon: <Settings className="h-4 w-4" />, action: () => setTab("settings"), color: "text-slate-600 bg-slate-50 border-slate-200" },
                ].map(a => (
                  <button key={a.label} onClick={a.action} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium hover:opacity-80 transition-opacity ${a.color}`}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ NURSES TAB ═══ */}
        {tab === "nurses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold">Nurse Management</h1>
                <p className="text-sm text-muted-foreground">Review applications and manage registered nurses</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 hidden sm:flex">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input className="pl-8 h-8 text-sm" placeholder="Search nurses..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {(["all", "pending", "approved", "rejected"] as NurseFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setNurseFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                    nurseFilter === f
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                  }`}
                >
                  {f} {f === "pending" && pendingCount > 0 && `(${pendingCount})`}
                </button>
              ))}
            </div>

            {/* Nurse cards */}
            <div className="space-y-3">
              {filteredNurses.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No nurses found</p>
                  </CardContent>
                </Card>
              )}
              {filteredNurses.map(nurse => (
                <Card key={nurse.id} className={`border shadow-sm ${nurse.status === "pending" ? "border-amber-200 bg-amber-50/20" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg shrink-0">
                        {nurse.name.charAt(0)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold">{nurse.name}</p>
                          <NurseStatusBadge status={nurse.status} />
                          <span className="text-xs text-muted-foreground">#{nurse.id}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{nurse.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{nurse.experience} exp</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{nurse.phone}</span>
                          {nurse.rating && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{nurse.rating}</span>}
                          {nurse.earnings > 0 && <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3 text-emerald-600" />{nurse.earnings.toLocaleString()} earned</span>}
                        </div>
                        {/* Specializations */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {nurse.specializations.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-[11px] font-medium">{s}</span>
                          ))}
                        </div>
                        {/* Documents */}
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {[
                            { label: "Nursing Cert", ok: nurse.documents.nursingCert },
                            { label: "ID Proof", ok: nurse.documents.idProof },
                            { label: "CV / Resume", ok: nurse.documents.cvUploaded },
                          ].map(doc => (
                            <span key={doc.label} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${doc.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                              {doc.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {doc.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Actions */}
                      {nurse.status === "pending" && (
                        <div className="flex gap-2 shrink-0 self-start">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => approveNurse(nurse.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1" onClick={() => rejectNurse(nurse.id)}>
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                      {nurse.status === "approved" && (
                        <div className="flex gap-2 shrink-0 self-start">
                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1 text-xs" onClick={() => rejectNurse(nurse.id)}>
                            <UserX className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PATIENTS TAB ═══ */}
        {tab === "patients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold">Patient Management</h1>
                <p className="text-sm text-muted-foreground">{PATIENTS.length} registered patients</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="pl-8 h-8 text-sm" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="space-y-3">
              {PATIENTS.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())).map(patient => (
                <Card key={patient.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{patient.name}</p>
                          <Badge className={`text-xs ${patient.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                            {patient.status === "active" ? "🟢 Active" : "⚪ Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">#{patient.id}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{patient.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {patient.joinedAt}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Last: {patient.lastVisit}</span>
                        </div>
                      </div>
                      <div className="flex gap-4 text-center shrink-0">
                        <div>
                          <p className="font-bold text-sm">{patient.visits}</p>
                          <p className="text-[11px] text-muted-foreground">Visits</p>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-emerald-600">₹{patient.totalSpent.toLocaleString()}</p>
                          <p className="text-[11px] text-muted-foreground">Spent</p>
                        </div>
                        <Button size="sm" variant="outline" className="gap-1 text-xs self-center">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══ REQUESTS TAB ═══ */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Service Requests</h1>
                <p className="text-sm text-muted-foreground">Monitor all patient–nurse service requests</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {liveCount} live
                </div>
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {REQUESTS.map(req => (
                <Card key={req.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm">{req.patient}</p>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{req.nurse}</p>
                          <RequestStatusBadge status={req.status} />
                          <Badge className={`text-xs ${req.mode === "temporary" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-sky-100 text-sky-700 border-sky-200"}`}>
                            {req.mode === "temporary" ? "⚡ Quick" : "📅 Long-term"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground bg-slate-50 rounded-lg px-3 py-2 border">{req.problem}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.address}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.createdAt}</span>
                          <span className="text-xs font-mono text-slate-400">{req.id}</span>
                          {req.amount > 0 && <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{req.amount}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ANALYTICS TAB ═══ */}
        {tab === "analytics" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold">Platform Analytics</h1>
              <p className="text-sm text-muted-foreground">Revenue, growth, and performance insights</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<IndianRupee className="h-5 w-5 text-emerald-600" />} label="Total Revenue" value={`₹${(STATS.totalRevenue / 1000).toFixed(0)}K`} trend={{ val: "+24%", up: true }} color="bg-emerald-50" />
              <StatCard icon={<CheckCircle2 className="h-5 w-5 text-teal-600" />} label="Completed Visits" value={STATS.completedVisits.toLocaleString()} trend={{ val: "+8%", up: true }} color="bg-teal-50" />
              <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Avg Rating" value={STATS.avgRating} sub="Platform-wide" color="bg-yellow-50" />
              <StatCard icon={<Users className="h-5 w-5 text-sky-600" />} label="Patient Retention" value="78%" trend={{ val: "+5%", up: true }} color="bg-sky-50" />
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold">Revenue — Last 7 Days</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <RevenueBar data={REVENUE_DATA} />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center border-t pt-3">
                    {[
                      { label: "This Week", val: "₹97,800", up: true, pct: "+24%" },
                      { label: "Avg/Day", val: "₹13,971", up: true, pct: "+18%" },
                      { label: "Best Day", val: "₹22,100", up: true, pct: "Sat" },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-bold text-sm">{item.val}</p>
                        <p className="text-xs text-emerald-600">{item.pct}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Specialization breakdown */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold">Nurse Specializations</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {[
                    { name: "General Care", pct: 42, count: 60, color: "bg-teal-500" },
                    { name: "Elder Care", pct: 25, count: 35, color: "bg-sky-500" },
                    { name: "Pediatric", pct: 18, count: 26, color: "bg-violet-500" },
                    { name: "ICU / Emergency", pct: 10, count: 14, color: "bg-orange-500" },
                    { name: "Other", pct: 5, count: 7, color: "bg-slate-400" },
                  ].map(item => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.count} nurses ({item.pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* City-wise breakdown */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold">Top Cities by Revenue</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {[
                    { city: "Delhi NCR", revenue: "₹89,400", visits: 312, pct: 31 },
                    { city: "Noida / Greater Noida", revenue: "₹64,200", visits: 228, pct: 23 },
                    { city: "Gurugram", revenue: "₹52,800", visits: 188, pct: 19 },
                    { city: "Ghaziabad", revenue: "₹44,100", visits: 156, pct: 16 },
                    { city: "Faridabad", revenue: "₹34,000", visits: 122, pct: 12 },
                  ].map((row, i) => (
                    <div key={row.city} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{row.city}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{row.visits} visits</span>
                            <span className="font-bold text-emerald-600">{row.revenue}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {tab === "settings" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold">Admin Settings</h1>
              <p className="text-sm text-muted-foreground">Configure platform behavior and preferences</p>
            </div>

            {/* Platform config */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Settings className="h-4 w-4" /> Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 divide-y">
                {[
                  {
                    label: "Maintenance Mode", desc: "Temporarily disable patient access for maintenance",
                    val: maintenanceMode, onChange: setMaintenanceMode, danger: true
                  },
                  {
                    label: "Auto-approve Nurses", desc: "Automatically approve nurses with complete documents",
                    val: autoApprove, onChange: setAutoApprove, danger: false
                  },
                ].map(item => (
                  <div key={item.label} className={`py-3 flex items-center justify-between gap-4 ${item.danger && item.val ? "bg-red-50 -mx-4 px-4 rounded" : ""}`}>
                    <div>
                      <p className={`text-sm font-medium ${item.danger && item.val ? "text-red-700" : ""}`}>{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.val} onCheckedChange={item.onChange} />
                  </div>
                ))}
                {[
                  { label: "Push Notifications", desc: "Send FCM notifications to nurses for new requests", val: true },
                  { label: "AI Interview Required", desc: "Require AI video interview for long-term placements", val: true },
                  { label: "AI Triage for Patients", desc: "Use AI to assess patient severity before matching", val: true },
                ].map(item => (
                  <div key={item.label} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.val} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Commission settings */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Commission & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {[
                  { label: "Platform Commission", desc: "% of each visit fee", val: "15%" },
                  { label: "Quick Visit Base Fee", desc: "Minimum charge for temporary visits", val: "₹150" },
                  { label: "Long-term Daily Rate", desc: "Minimum daily rate for long-term", val: "₹800" },
                  { label: "AI Interview Fee", desc: "Charged to agency for vetting", val: "₹0 (Free)" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-teal-700">{item.val}</span>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2">Edit</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Admin info */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Shield className="h-4 w-4" /> Admin Account</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl">A</div>
                  <div>
                    <p className="font-bold">Super Admin</p>
                    <p className="text-sm text-muted-foreground">admin@sevasetu.in</p>
                    <Badge className="mt-1 bg-teal-100 text-teal-700 border-teal-200 text-xs">🛡️ Full Access</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Settings className="h-3.5 w-3.5" /> Change Password
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" /> Manage Admins
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs text-red-500 border-red-200 hover:bg-red-50">
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System info */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2"><Globe className="h-4 w-4" /> System Status</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 divide-y">
                {[
                  { label: "Firebase Realtime DB", status: "🟢 Connected", detail: "Latency: 12ms" },
                  { label: "FCM Push Notifications", status: "🟢 Active", detail: "All tokens valid" },
                  { label: "AI Interview Service", status: "🟢 Running", detail: "Gemini 1.5 Flash" },
                  { label: "AI Triage Engine", status: "🟢 Running", detail: "Gemini" },
                  { label: "Platform Uptime", status: "🟢 99.7%", detail: "Last 30 days" },
                ].map(item => (
                  <div key={item.label} className="py-2.5 flex justify-between items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-xs font-medium">{item.status}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
