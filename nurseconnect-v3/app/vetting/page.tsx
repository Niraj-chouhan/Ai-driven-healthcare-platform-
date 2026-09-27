"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Bot, BriefcaseMedical, Lock, CheckCircle2 } from "lucide-react"
import type { IAIEvaluation } from "@/lib/vetting-types"
import { NurseRegistrationForm } from "@/components/vetting/nurse-registration-form"
import type { NurseFormData } from "@/components/vetting/nurse-registration-form"
import { AIInterviewChat } from "@/components/vetting/ai-interview-chat"
import { JobFeed } from "@/components/vetting/job-feed"

type Tab = "register" | "interview" | "jobfeed"

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "register", label: "Registration", icon: <ShieldCheck className="h-4 w-4" />, description: "Nurse onboarding with Zod validation" },
  { id: "interview", label: "AI Interview", icon: <Bot className="h-4 w-4" />, description: "5 clinical questions by Dr. Meera Krishnan" },
  { id: "jobfeed", label: "Job Feed", icon: <BriefcaseMedical className="h-4 w-4" />, description: "Live patient requests for verified nurses" },
]

export default function VettingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("register")
  const [nurseForm, setNurseForm] = useState<NurseFormData | null>(null)
  const [verified, setVerified] = useState(false)
  const [evaluation, setEvaluation] = useState<IAIEvaluation | null>(null)

  function handleRegistered(data: NurseFormData) {
    setNurseForm(data)
    setActiveTab("interview")
  }

  function handleVerified(ev: IAIEvaluation) {
    setEvaluation(ev)
    setVerified(true)
    setTimeout(() => setActiveTab("jobfeed"), 2000)
  }

  const tabUnlocked: Record<Tab, boolean> = {
    register: true,
    interview: !!nurseForm,
    jobfeed: verified,
  }

  // Build nurse object for AIInterviewChat
  const nurseForInterview = nurseForm ? {
    id: `nurse-${Date.now()}`,
    name: nurseForm.name,
    email: nurseForm.email,
    phone: nurseForm.phone,
    specialization: nurseForm.specializations[0] || "General Nursing",
    specializations: nurseForm.specializations,
    experienceYears: nurseForm.experienceYears,
    city: nurseForm.city,
    isVerified: false,
    interviewStatus: "Pending" as const,
    registeredAt: new Date(),
    location: { lat: 0, lng: 0, address: nurseForm.fullAddress, city: nurseForm.city },
    qualificationDocs: [],
  } : null

  // Build INurse-compatible object for JobFeed
  const nurseForJobFeed = nurseForInterview && evaluation ? {
    ...nurseForInterview,
    isVerified: true,
    interviewStatus: "Qualified" as const,
    interviewScore: evaluation.confidenceScore,
    aiEvaluation: evaluation,
  } : null

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">NurseVet AI — Vetting Module</h1>
              <p className="text-sm text-primary-foreground/80">Real Gemini AI nurse verification & patient job matching</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {["Next.js 16", "TypeScript", "Zod Validated", "Gemini AI", "Firebase"].map(t => (
              <Badge key={t} variant="secondary" className="text-[10px] bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">{t}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex">
            {TABS.map((tab, idx) => {
              const unlocked = tabUnlocked[tab.id]
              const isActive = activeTab === tab.id
              const isPassed = tab.id === "interview" && verified

              return (
                <button
                  key={tab.id}
                  onClick={() => unlocked && setActiveTab(tab.id)}
                  disabled={!unlocked}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all ${
                    isActive ? "border-primary text-primary"
                      : unlocked ? "border-transparent text-muted-foreground hover:text-foreground"
                      : "border-transparent text-muted-foreground/40 cursor-not-allowed"
                  }`}
                >
                  <span className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    isActive ? "bg-primary text-primary-foreground"
                      : isPassed ? "bg-emerald-500 text-white"
                      : unlocked ? "bg-muted text-foreground"
                      : "bg-muted text-muted-foreground/40"
                  }`}>
                    {isPassed ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {!unlocked && <Lock className="h-3 w-3 opacity-40" />}
                  {isPassed && <Badge className="text-[9px] h-4 bg-emerald-100 text-emerald-700 hidden sm:flex">Passed</Badge>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {activeTab === "register" && <NurseRegistrationForm onComplete={handleRegistered} />}

        {activeTab === "interview" && nurseForInterview && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold">Clinical Interview</h2>
              <p className="text-sm text-muted-foreground">
                Real AI evaluation by Dr. Meera Krishnan • Powered by Gemini
              </p>
            </div>
            <AIInterviewChat nurse={nurseForInterview} onVerified={handleVerified} />
          </div>
        )}

        {activeTab === "interview" && !nurseForInterview && (
          <div className="text-center py-20 text-muted-foreground">
            <Lock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Complete registration first</p>
          </div>
        )}

        {activeTab === "jobfeed" && nurseForJobFeed && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Live Patient Job Feed</h2>
              <p className="text-sm text-muted-foreground">Real-time patient requests for verified nurses</p>
            </div>
            <JobFeed nurse={nurseForJobFeed as any} />
          </div>
        )}

        {activeTab === "jobfeed" && !verified && (
          <div className="text-center py-20 text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="font-semibold text-foreground">Access Restricted</h3>
            <p className="text-sm mt-1">Complete the AI interview to unlock the job feed.</p>
          </div>
        )}
      </main>
    </div>
  )
}
