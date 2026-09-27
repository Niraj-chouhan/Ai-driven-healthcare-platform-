"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart, MessageCircle, Calendar, FileText, LogOut,
  User, Phone, Mail, MapPin, Bell, BellOff, Wifi, WifiOff
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { useRouter } from "next/navigation"
import { EmpathyChat } from "@/components/chatbot/empathy-chat"
import { BookNurseFlow } from "@/components/booking/book-nurse-flow"
import { HealthRecordsMini } from "@/components/patient/health-records-mini"
import { SOSButton } from "@/components/health/sos-button"

type Tab = "chat" | "book" | "records" | "profile"

// Status ke liye color mapping
const statusColors: Record<string, string> = {
  matched:      "bg-orange-100 text-orange-700",
  accepted:     "bg-emerald-100 text-emerald-700",
  "in-progress":"bg-blue-100 text-blue-700",
  completed:    "bg-slate-100 text-slate-700",
  cancelled:    "bg-red-100 text-red-700",
  pending:      "bg-yellow-100 text-yellow-700",
}

const statusLabels: Record<string, string> = {
  matched:      "🔍 Finding a nurse",
  accepted:     "✅ Nurse Assigned",
  "in-progress":"🚀 Nurse en route",
  completed:    "✅ Completed",
  cancelled:    "❌ Cancelled",
  pending:      "⏳ Pending",
}

export function PatientDashboard() {
  const {
    userName, setUserRole, patientProfile, nurseRequests,
    notificationPermission, requestPushPermission, isFirebaseConnected
  } = useApp()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("chat")

  function handleLogout() { setUserRole(null); router.push("/") }

  const myRequests = nurseRequests.filter(
    r => r.patientName === (patientProfile?.name || userName)
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">SevaSetu</p>
              <p className="text-xs text-muted-foreground">Welcome, {patientProfile?.name || userName || "Patient"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* App status indicator */}
            <div className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isFirebaseConnected ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
              {isFirebaseConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isFirebaseConnected ? "Live" : "Local"}</span>
            </div>
            {/* Notification status */}
            {notificationPermission !== "granted" ? (
              <Button variant="ghost" size="sm" onClick={requestPushPermission} className="gap-1 text-orange-600 text-xs">
                <BellOff className="h-4 w-4" />
                <span className="hidden sm:inline">Allow Alerts</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Bell className="h-4 w-4" />
              </div>
            )}
            <Badge variant="secondary" className="text-xs hidden sm:flex">Patient</Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border bg-white">
          <div className="container mx-auto px-4 flex gap-0">
            {([
              { id: "chat" as Tab, icon: MessageCircle, label: "AI Help" },
              { id: "book" as Tab, icon: Calendar, label: "Book Nurse" },
              { id: "records" as Tab, icon: FileText, label: "Records" },
              { id: "profile" as Tab, icon: User, label: "Profile" },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {tab === "chat" && <EmpathyChat />}
        {tab === "book" && <BookNurseFlow />}
        {tab === "records" && <HealthRecordsMini />}

        {tab === "profile" && (
          <div className="space-y-5">
            {/* Profile card */}
            <Card className="border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-700">
                    {(patientProfile?.name || userName || "P").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{patientProfile?.name || userName || "Patient"}</h2>
                    <Badge className="mt-1 bg-sky-100 text-sky-700 border-sky-200 text-xs">Patient Account</Badge>
                  </div>
                </div>

                <div className="divide-y">
                  {[
                    { icon: Phone, label: "Phone", value: patientProfile?.phone || "Not provided" },
                    { icon: Mail, label: "Email", value: patientProfile?.email || "Not provided" },
                    { icon: MapPin, label: "Address", value: patientProfile?.address || "Not provided" },
                    { icon: Bell, label: "Notifications", value: notificationPermission === "granted" ? "✅ Active" : "❌ Disabled" },
                  ].map(item => (
                    <div key={item.label} className="py-2.5 flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {notificationPermission !== "granted" && (
                  <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" onClick={requestPushPermission}>
                    <Bell className="h-4 w-4" /> Enable Push Notifications
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* My requests — REAL-TIME updates dikhenge */}
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-muted-foreground">
                My Requests
              {isFirebaseConnected && <Badge className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5">🔴 LIVE</Badge>}
              </h3>
              {myRequests.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground text-sm">
                    No requests made yet. Book a nurse to get started.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {myRequests.map(req => (
                    <Card key={req.id} className="border shadow-sm">
                      <CardContent className="p-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate max-w-[200px]">{req.problem}</p>
                          <Badge className={`text-xs shrink-0 ${statusColors[req.status] || "bg-slate-100 text-slate-700"}`}>
                            {statusLabels[req.status] || req.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{req.mode === "temporary" ? "⚡ Quick" : "📅 Long-term"}</span>
                          <span>•</span>
                          <span>{req.id}</span>
                        </div>
                        {req.status === "in-progress" && (
                          <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-700 font-medium">
                            🚀 Nurse is on the way! She will arrive soon.
                          </div>
                        )}
                        {req.status === "accepted" && (
                          <div className="bg-emerald-50 rounded-lg p-2 text-xs text-emerald-700 font-medium">
                            ✅ Nurse assigned. You will get an update soon.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <SOSButton />
    </div>
  )
}
