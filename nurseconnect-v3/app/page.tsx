"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, ChevronRight, Stethoscope, User, ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { useRouter } from "next/navigation"

type Mode = "home" | "patient-login" | "nurse-login"

export default function HomePage() {
  const { setUserRole, setUserName, setPatientProfile, setNurseProfile } = useApp()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("home")

  // Patient fields
  const [pName, setPName] = useState("")
  const [pPhone, setPPhone] = useState("")
  const [pEmail, setPEmail] = useState("")
  const [pAddress, setPAddress] = useState("")

  // Nurse fields
  const [nName, setNName] = useState("")
  const [nPhone, setNPhone] = useState("")
  const [nEmail, setNEmail] = useState("")

  function handlePatientLogin() {
    if (!pName.trim()) return
    setUserName(pName)
    setUserRole("patient")
    setPatientProfile({ name: pName, phone: pPhone, email: pEmail, address: pAddress })
    router.push("/patient")
  }

  function handleNurseLogin() {
    if (!nName.trim()) return
    setUserName(nName)
    setUserRole("nurse")
    setNurseProfile({ name: nName, phone: nPhone, email: nEmail, specializations: [], experience: "", address: "", city: "" })
    router.push("/nurse-portal")
  }

  if (mode === "patient-login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl border-0">
          <CardContent className="p-8 space-y-5">
            <button onClick={() => setMode("home")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <div>
              <div className="h-12 w-12 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-sky-600" />
              </div>
              <h2 className="text-2xl font-bold">Welcome, Patient</h2>
              <p className="text-muted-foreground text-sm">We're here to help you feel better 💙</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Your Name *</Label>
                <Input placeholder="Rahul Sharma" value={pName} onChange={e => setPName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone Number</Label>
                <Input placeholder="+91 98765 00000" value={pPhone} onChange={e => setPPhone(e.target.value)} type="tel" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Gmail / Email</Label>
                <Input placeholder="rahul@gmail.com" value={pEmail} onChange={e => setPEmail(e.target.value)} type="email" />
                <p className="text-xs text-muted-foreground">Next time, login directly with Gmail</p>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address (optional)</Label>
                <Input placeholder="Flat 12, Sector 5, Noida" value={pAddress} onChange={e => setPAddress(e.target.value)} />
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handlePatientLogin} disabled={!pName.trim()}>
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            {/* Google login simulation */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => {
              setPName("Google User"); setPEmail("user@gmail.com")
            }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "nurse-login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl border-0">
          <CardContent className="p-8 space-y-5">
            <button onClick={() => setMode("home")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold">Nurse Portal</h2>
              <p className="text-muted-foreground text-sm">Sign in to your verified nurse account</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Your Name *</Label>
                <Input placeholder="Priya Sharma" value={nName} onChange={e => setNName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                <Input placeholder="+91 98765 00001" value={nPhone} onChange={e => setNPhone(e.target.value)} type="tel" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Gmail / Email *</Label>
                <Input placeholder="nurse@gmail.com" value={nEmail} onChange={e => setNEmail(e.target.value)} type="email" />
                <p className="text-xs text-muted-foreground">Next time, login directly with Gmail</p>
              </div>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg" onClick={handleNurseLogin} disabled={!nName.trim()}>
              Sign In <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => {
              setNName("Dr. Nurse"); setNEmail("nurse@gmail.com")
            }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>

            <Button variant="outline" className="w-full" size="lg" onClick={() => router.push("/register")}>
              New Nurse? Register Here
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Heart className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">SevaSetu</h1>
        <p className="text-muted-foreground mt-2 text-lg">Verified nurses, on-demand care — at your doorstep</p>
        <Badge variant="secondary" className="mt-3 text-xs">🇮🇳 India's Patient-First Booking System</Badge>
      </div>

      <div className="grid gap-4 w-full max-w-md">
        <button onClick={() => setMode("patient-login")} className="group text-left">
          <Card className="border-2 border-transparent group-hover:border-sky-400 transition-all shadow-md group-hover:shadow-xl group-hover:-translate-y-1 duration-200">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-sky-200 transition-colors">
                <User className="h-7 w-7 text-sky-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">I'm a Patient / Guardian</p>
                <p className="text-sm text-muted-foreground">Book a nurse, get care at home</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </button>

        <button onClick={() => setMode("nurse-login")} className="group text-left">
          <Card className="border-2 border-transparent group-hover:border-emerald-400 transition-all shadow-md group-hover:shadow-xl group-hover:-translate-y-1 duration-200">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                <Stethoscope className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">I'm a Nurse</p>
                <p className="text-sm text-muted-foreground">Sign in, accept requests, earn</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </button>
      </div>

      <div className="flex items-center gap-6 mt-10 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> AI-Vetted Nurses</div>
        <div className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-rose-500" /> 24/7 Support</div>
        <div className="flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5 text-sky-500" /> Verified Credentials</div>
      </div>

      <button onClick={() => router.push("/admin")} className="mt-6 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1 mx-auto">
        <Shield className="h-3 w-3" /> Admin Panel
      </button>
    </div>
  )
}
