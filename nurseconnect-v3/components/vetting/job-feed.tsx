"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Heart,
  Thermometer,
  Activity,
  ShieldCheck,
  Sparkles,
  BriefcaseMedical,
  CheckCircle2,
  X,
  Wifi,
} from "lucide-react"
import type { INurse, IVettingPatientRequest, RiskLevel, Specialization } from "@/lib/vetting-types"
import { useApp } from "@/lib/app-context"

interface JobFeedProps {
  nurse: INurse
}

// ─────────────────────────────────────────────
// Mock patient requests (in real app: Socket.io)
// ─────────────────────────────────────────────

const MOCK_REQUESTS: IVettingPatientRequest[] = [
  {
    id: crypto.randomUUID(),
    patientId: "PAT-001",
    name: "Rajesh Kumar",
    age: 65,
    gender: "Male",
    phone: "+91 98765 43210",
    address: "42, Lajpat Nagar, New Delhi",
    distance: "1.8 km",
    eta: "7 mins",
    riskLevel: "high",
    requiredSpecialization: "ICU",
    chiefComplaints: ["Chest Pain", "Shortness of Breath", "Dizziness"],
    vitals: { temperature: "99.2°F", heartRate: "98 bpm", bp: "160/95 mmHg" },
    aiSummary:
      "65-year-old male with acute chest discomfort and dyspnea. History of hypertension. Immediate cardiac assessment required.",
    status: "pending",
    createdAt: new Date(Date.now() - 180000),
  },
  {
    id: crypto.randomUUID(),
    patientId: "PAT-002",
    name: "Sunita Devi",
    age: 45,
    gender: "Female",
    phone: "+91 98765 43211",
    address: "15, Saket, New Delhi",
    distance: "3.1 km",
    eta: "12 mins",
    riskLevel: "medium",
    requiredSpecialization: "General",
    chiefComplaints: ["Fever", "Body Aches", "Fatigue"],
    vitals: { temperature: "101.5°F", heartRate: "88 bpm", bp: "120/80 mmHg" },
    aiSummary:
      "45-year-old female with persistent fever for 2 days. Likely viral infection. Hydration and monitoring recommended.",
    status: "pending",
    createdAt: new Date(Date.now() - 600000),
  },
  {
    id: crypto.randomUUID(),
    patientId: "PAT-003",
    name: "Aarav Mehta",
    age: 4,
    gender: "Male",
    phone: "+91 98765 43212",
    address: "8, Vasant Kunj, New Delhi",
    distance: "2.4 km",
    eta: "10 mins",
    riskLevel: "medium",
    requiredSpecialization: "Pediatrics",
    chiefComplaints: ["High Fever", "Rash", "Irritability"],
    vitals: { temperature: "103°F", heartRate: "110 bpm" },
    aiSummary:
      "4-year-old male with high fever and skin rash. Rule out viral exanthem. Pediatric nurse required.",
    status: "pending",
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: crypto.randomUUID(),
    patientId: "PAT-004",
    name: "Kamla Bai",
    age: 78,
    gender: "Female",
    phone: "+91 98765 43213",
    address: "27, Uttam Nagar, New Delhi",
    distance: "4.5 km",
    eta: "18 mins",
    riskLevel: "low",
    requiredSpecialization: "Elder Care",
    chiefComplaints: ["Joint Pain", "Mobility Issues"],
    vitals: { bp: "135/85 mmHg" },
    aiSummary:
      "78-year-old female with chronic joint pain requiring daily care assistance and physical therapy support.",
    status: "pending",
    createdAt: new Date(Date.now() - 900000),
  },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

const riskConfig: Record<
  RiskLevel,
  { label: string; badgeClass: string; dotClass: string; borderClass: string; bgClass: string }
> = {
  high: {
    label: "HIGH Risk",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    dotClass: "bg-red-500",
    borderClass: "border-red-300",
    bgClass: "bg-red-50",
  },
  medium: {
    label: "MEDIUM Risk",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    borderClass: "border-amber-300",
    bgClass: "bg-amber-50",
  },
  low: {
    label: "LOW Risk",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-300",
    bgClass: "bg-emerald-50",
  },
}

// ─────────────────────────────────────────────
// Job Feed Component
// ─────────────────────────────────────────────

export function JobFeed({ nurse }: JobFeedProps) {
  const { addNotification } = useApp()
  const [requests, setRequests] = useState<IVettingPatientRequest[]>(MOCK_REQUESTS)
  const [filter, setFilter] = useState<"all" | RiskLevel>("all")
  const [acceptedId, setAcceptedId] = useState<string | null>(null)
  const [liveAlert, setLiveAlert] = useState(true)

  // Simulate real-time new request (Socket.io equivalent)
  useEffect(() => {
    const timer = setTimeout(() => {
      const newReq: IVettingPatientRequest = {
        id: crypto.randomUUID(),
        patientId: "PAT-005",
        name: "Geeta Verma",
        age: 55,
        gender: "Female",
        phone: "+91 98765 43214",
        address: "3, Dwarka Sector 12, New Delhi",
        distance: "2.0 km",
        eta: "9 mins",
        riskLevel: "high",
        requiredSpecialization: nurse.specialization,
        chiefComplaints: ["Severe Headache", "Blurred Vision", "Nausea"],
        vitals: { bp: "180/110 mmHg", heartRate: "92 bpm" },
        aiSummary:
          "55-year-old female with hypertensive crisis symptoms. Immediate intervention required — matched to your specialization.",
        status: "matched",
        matchedNurseId: nurse.id,
        createdAt: new Date(),
      }
      setRequests((prev) => [newReq, ...prev])
      addNotification({
        type: "warning",
        title: "🔴 New High-Risk Request",
        message: `Geeta Verma (55F) matched to you — 2.0 km away`,
      })
    }, 10000)
    return () => clearTimeout(timer)
  }, [nurse.id, nurse.specialization, addNotification])

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.riskLevel === filter)

  function handleAccept(req: IVettingPatientRequest) {
    setAcceptedId(req.id)
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: "accepted" } : r))
    )
    addNotification({
      type: "success",
      title: "Request Accepted",
      message: `Navigate to ${req.name} — ETA ${req.eta}`,
    })
  }

  function handleDecline(id: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    addNotification({
      type: "info",
      title: "Request Declined",
      message: "Request removed from your feed.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Verified nurse banner */}
      <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-emerald-800">{nurse.name} — Verified Nurse ✅</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {nurse.specialization} · Score:{" "}
            {nurse.aiEvaluation?.confidenceScore ?? "—"}/100 ·{" "}
            {nurse.experienceYears} yrs exp
          </p>
        </div>
        {liveAlert && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shrink-0">
            <Wifi className="h-3 w-3 animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Filter:</span>
        {(["all", "high", "medium", "low"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="h-7 text-xs rounded-full"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + " Risk"}
          </Button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Request cards */}
      {filtered.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            <BriefcaseMedical className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No requests in this filter</p>
          </CardContent>
        </Card>
      )}

      {filtered.map((req) => {
        const rc = riskConfig[req.riskLevel]
        const isAccepted = acceptedId === req.id
        const isNew = req.status === "matched"

        return (
          <Card
            key={req.id}
            className={`shadow-md overflow-hidden transition-all border-2 ${
              isAccepted ? "border-emerald-400" : isNew ? rc.borderClass + " ring-2 ring-offset-1 ring-amber-400" : rc.borderClass
            }`}
          >
            {/* Risk header band */}
            <div className={`px-4 py-2.5 ${rc.bgClass} flex items-center justify-between border-b ${rc.borderClass}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${rc.dotClass} animate-pulse`} />
                <Badge variant="outline" className={`text-[11px] font-bold ${rc.badgeClass}`}>
                  {rc.label}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {req.requiredSpecialization}
                </Badge>
                {isNew && (
                  <Badge className="text-[10px] bg-amber-500 text-white animate-bounce">
                    NEW MATCH
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {req.distance}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {req.eta}
                </span>
                <span>{timeAgo(req.createdAt)}</span>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Patient info */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{req.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {req.age} yrs · {req.gender} · {req.address}
                  </p>
                </div>
                {req.vitals?.bp && (
                  <div className="text-right bg-muted rounded-lg px-3 py-2 shrink-0">
                    <p className="text-[10px] text-muted-foreground">BP</p>
                    <p className="text-sm font-bold">{req.vitals.bp}</p>
                  </div>
                )}
              </div>

              {/* Chief complaints */}
              <div className="flex gap-2 flex-wrap">
                {req.chiefComplaints.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Vitals row */}
              {(req.vitals?.temperature || req.vitals?.heartRate) && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {req.vitals.temperature && (
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      {req.vitals.temperature}
                    </span>
                  )}
                  {req.vitals.heartRate && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {req.vitals.heartRate}
                    </span>
                  )}
                  {req.vitals.bp && (
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {req.vitals.bp}
                    </span>
                  )}
                </div>
              )}

              {/* AI Summary */}
              <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                    AI Clinical Summary
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{req.aiSummary}</p>
              </div>

              {/* Actions */}
              {isAccepted ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    Accepted — Navigate to patient
                  </span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAccept(req)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDecline(req.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
