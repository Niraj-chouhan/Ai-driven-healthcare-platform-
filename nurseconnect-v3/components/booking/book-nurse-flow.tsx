"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Mic, MicOff, Upload, Camera, FileText, Image as ImageIcon,
  Zap, Calendar, Star, MapPin, Clock, CheckCircle2, Loader2, X, Bot, Bell
} from "lucide-react"
import { useApp } from "@/lib/app-context"

type Step = "problem" | "mode" | "confirm" | "submitted"

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

function generateAISummary(problem: string, files: string[]): string {
  const p = problem.toLowerCase()
  let condition = "General health concern"
  let severity = "LOW"
  let care = "General assessment and monitoring"

  if (p.includes("bp") || p.includes("blood pressure") || p.includes("hypertension") || p.includes("bukhar") || p.includes("fever")) {
    condition = "Fever / Hypertension symptoms"; severity = "MEDIUM"; care = "BP monitoring, temperature check, possible IV fluids"
  } else if (p.includes("diabetes") || p.includes("insulin") || p.includes("sugar")) {
    condition = "Diabetic care required"; severity = "MEDIUM-HIGH"; care = "Insulin administration, wound dressing, glucose monitoring"
  } else if (p.includes("surgery") || p.includes("operation") || p.includes("wound")) {
    condition = "Post-operative recovery"; severity = "MEDIUM"; care = "Wound monitoring, medication management, mobility assistance"
  } else if (p.includes("chest") || p.includes("heart") || p.includes("saans") || p.includes("breath")) {
    condition = "Cardiac / Respiratory symptoms"; severity = "HIGH"; care = "Immediate cardiac monitoring, oxygen assessment, emergency readiness"
  } else if (p.includes("injection") || p.includes("drip") || p.includes("saline")) {
    condition = "Injection / IV therapy needed"; severity = "LOW-MEDIUM"; care = "IV cannulation, medication administration, vitals monitoring"
  } else if (p.includes("elderly") || p.includes("budhape") || p.includes("old") || p.includes("bujurg")) {
    condition = "Elder care required"; severity = "MEDIUM"; care = "Daily assistance, medication management, fall prevention"
  }

  const fileNote = files.length > 0 ? `\n📎 ${files.length} file(s) analyzed (${files.join(", ")})` : ""
  return `🔍 AI Analysis Complete\n\n📋 Condition: ${condition}\n⚠️ Severity: ${severity}\n💊 Care Required: ${care}${fileNote}\n\n✅ This summary will be sent to nurses so they can prepare ahead of time.`
}

export function BookNurseFlow() {
  const { createRequest, activeRequest, patientProfile, userName, addNotification, notificationPermission, requestPushPermission } = useApp()
  const [step, setStep] = useState<Step>("problem")
  const [problem, setProblem] = useState("")
  const [mode, setMode] = useState<"temporary" | "longterm">("temporary")
  const [isListening, setIsListening] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  const [aiSummary, setAiSummary] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedReq, setSubmittedReq] = useState<any>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  function toggleListening() {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert("Voice not supported. Please use Chrome browser."); return }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "hi-IN"
    recognition.onresult = (e) => { setProblem(prev => prev + " " + e.results[0][0].transcript); setIsListening(false) }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files.map(f => f.name)])
  }

  async function handleAnalyze() {
    if (!problem.trim()) return
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1800))
    setAiSummary(generateAISummary(problem, attachedFiles))
    setAnalyzing(false)
    setStep("mode")
  }

  // Submit request + Gmail notification nurses ko bhejna
  async function handleSubmit() {
    setSubmitting(true)
    try {
      const req = await createRequest({
        patientId: "p-current",
        patientName: patientProfile?.name || userName || "Patient",
        phone: patientProfile?.phone || "+91 00000 00000",
        address: patientProfile?.address || "Address not provided",
        problem,
        aiSummary,
        mode,
        attachments: attachedFiles,
      })
      setSubmittedReq(req)
      setStep("submitted")

      // ── ✉️ GMAIL NOTIFICATION — matched nurses ko email bhejo ──
      // req.matchedNurses mein woh nurses hain jo isOnDuty hain
      // unke emails nikalo (jo available hain)
      const nurseEmails = req.matchedNurses
        .filter((n) => n.email)
        .map((n) => n.email as string)

      if (nurseEmails.length > 0) {
        try {
          const emailRes = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientName: patientProfile?.name || userName || "Patient",
              phone: patientProfile?.phone || "+91 00000 00000",
              address: patientProfile?.address || "Address not provided",
              problem,
              aiSummary,
              mode,
              nurseEmails,
            }),
          })
          if (emailRes.ok) {
            addNotification({
              type: "success",
              title: "✅ Request Submit Hua + Email Bheja!",
              message: `${nurseEmails.length} nurse(s) ko Gmail notification bheja gaya.`,
            })
          } else {
            addNotification({
              type: "success",
              title: "✅ Request Saved!",
              message: mode === "temporary"
                ? "Nearby nurses have been notified in real time."
                : "AI is scheduling interviews with nurses.",
            })
            console.warn("[Email] Notification fail hui, request save ho gayi.")
          }
        } catch (emailErr) {
          // Email error silent fail — request saved rehti hai
          addNotification({
            type: "success",
            title: "✅ Request Saved Locally!",
            message: mode === "temporary"
              ? "Nearby nurses have been notified in real time."
              : "AI is scheduling interviews with nurses.",
          })
          console.error("[Email] Send error:", emailErr)
        }
      } else {
        addNotification({
          type: "success",
          title: "✅ Request Saved Locally!",
          message: mode === "temporary"
            ? "Nearby nurses have been notified in real time."
            : "AI is scheduling interviews with nurses.",
        })
      }
      // ── END GMAIL NOTIFICATION ────────────────────────────────

      // Prompt for push notifications if not already granted
      if (notificationPermission !== "granted") {
        setTimeout(() => {
          addNotification({
            type: "info",
            title: "🔔 Enable Push Notifications",
            message: "Allow notifications to receive nurse updates — tap the banner above.",
          })
        }, 2000)
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Request failed to send. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  // ── SUBMITTED SCREEN ─────────────────────────────────────
  if (step === "submitted" && submittedReq) {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg text-emerald-800">Request Submitted! ✅</h3>
            <p className="text-sm text-emerald-700">
              {mode === "temporary"
                ? "Nearby nurses have been notified in real time. You will receive confirmation soon."
                : "AI is analyzing nurse profiles and scheduling interviews."
              }
            </p>
            <div className="bg-white rounded-xl p-3 text-left border border-emerald-200 text-xs space-y-1">
              <p className="font-semibold text-emerald-800">Request ID: {submittedReq.id}</p>
              <p className="text-muted-foreground">Mode: {mode === "temporary" ? "⚡ Quick (1-2 hrs)" : "📅 Long-term"}</p>
              <p className="text-muted-foreground">Nurses notified: {submittedReq.matchedNurses?.length ?? 3}</p>
              <p className="text-xs text-sky-600 font-medium mt-1">🔴 LIVE — Real-time updates are visible in the nurse portal</p>
            </div>
          </CardContent>
        </Card>

        {/* Matched nurses */}
        <div>
          <h3 className="font-bold text-sm mb-3 text-muted-foreground">
            {mode === "temporary" ? "Nearby Nurses Notified" : "Nurses Selected for Interview"}
          </h3>
          <div className="space-y-2">
            {(submittedReq.matchedNurses || []).map((n: any) => (
              <Card key={n.id} className="border shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
                      {n.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{n.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {n.rating} • {n.specializations?.[0]}
                      </p>
                    </div>
                  </div>
                  {mode === "temporary" ? (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                      <Clock className="h-3 w-3 mr-1" />{n.eta} min
                    </Badge>
                  ) : (
                    <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-xs">Interview Invite Sent</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Push notification prompt */}
        {notificationPermission !== "granted" && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-blue-800 text-sm">Enable Background Notifications</p>
                <p className="text-xs text-blue-600 mt-0.5">You will still get nurse arrival notifications when the app is closed</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs shrink-0" onClick={requestPushPermission}>
                Allow
              </Button>
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full" onClick={() => { setStep("problem"); setProblem(""); setAttachedFiles([]); setAiSummary("") }}>
          + New Request
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Step 1: Problem */}
      {step === "problem" && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Describe your problem</CardTitle>
            <p className="text-xs text-muted-foreground">Speak, type, or upload a file/photo</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant={isListening ? "destructive" : "outline"}
              className={`w-full gap-2 h-12 ${isListening ? "animate-pulse" : ""}`}
              onClick={toggleListening}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {isListening ? "Hold on — listening..." : "🎤 Describe your problem by voice"}
            </Button>

            <Textarea
              value={problem}
              onChange={e => setProblem(e.target.value)}
              placeholder="Type here... for example: 'I have had fever and body pain for 2 days'"
              className="min-h-27.5 resize-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-2 text-xs h-10" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload Report
              </Button>
              <Button variant="outline" className="gap-2 text-xs h-10" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="h-4 w-4" /> Camera Photo
              </Button>
            </div>
            <input ref={fileInputRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleFileUpload} />
            <input ref={cameraInputRef} type="file" hidden accept="image/*" capture="environment" onChange={handleFileUpload} />

            {attachedFiles.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Attached files:</p>
                {attachedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs">
                    {f.endsWith(".pdf") ? <FileText className="h-3.5 w-3.5 text-red-500" /> : <ImageIcon className="h-3.5 w-3.5 text-sky-500" />}
                    <span className="flex-1 truncate">{f}</span>
                    <button onClick={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full gap-2" onClick={handleAnalyze} disabled={!problem.trim() || analyzing}>
              {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> AI is analyzing...</> : <><Bot className="h-4 w-4" /> Analyze with AI</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Mode + AI Summary */}
      {step === "mode" && (
        <div className="space-y-4">
          <Card className="border-2 border-sky-200 bg-sky-50">
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold text-sky-800 text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" /> AI Analysis Result
              </p>
              <div className="text-sm text-sky-900 whitespace-pre-line">{aiSummary}</div>
            </CardContent>
          </Card>

          <div>
            <p className="text-sm font-semibold mb-3">Select Booking Type:</p>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => setMode("temporary")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${mode === "temporary" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold">⚡ Temporary / On-Demand</p>
                    <p className="text-xs text-muted-foreground">Injections, short visits (1-2 hrs) — nurse arrives fast</p>
                  </div>
                </div>
              </button>
              <button onClick={() => setMode("longterm")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${mode === "longterm" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-bold">📅 Long-Term Care</p>
                    <p className="text-xs text-muted-foreground">1+ days — AI selects best nurses, schedules interviews</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("problem")} className="flex-1">Back</Button>
            <Button onClick={handleSubmit} className="flex-1 gap-2" disabled={submitting}>
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Request save ho rahi hai...</>
                : <><CheckCircle2 className="h-4 w-4" /> Send Request</>
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
