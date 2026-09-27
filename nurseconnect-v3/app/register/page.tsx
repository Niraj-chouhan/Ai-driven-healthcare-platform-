"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Bot, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { NurseRegistrationForm, type NurseFormData } from "@/components/vetting/nurse-registration-form"
import { AIInterviewChat } from "@/components/vetting/ai-interview-chat"

type Stage = "form" | "interview" | "approved" | "rejected"

export default function RegisterPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("form")
  const [nurseData, setNurseData] = useState<NurseFormData | null>(null)

  function handleFormComplete(data: NurseFormData) {
    setNurseData(data)
    setStage("interview")
  }

  function handleInterviewComplete(passed: boolean) {
    setStage(passed ? "approved" : "rejected")
  }

  if (stage === "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center space-y-5">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-700">Welcome Aboard! 🎉</h2>
              <p className="text-muted-foreground mt-2">
                You've passed the AI vetting interview, {nurseData?.name}! Your profile is now under final review.
              </p>
            </div>
            <div className="text-sm text-left bg-emerald-50 rounded-xl p-4 space-y-1 border border-emerald-200">
              <p className="font-medium text-emerald-800">What happens next:</p>
              <p className="text-emerald-700">✓ Admin will verify your documents (24-48 hrs)</p>
              <p className="text-emerald-700">✓ You'll receive a confirmation email</p>
              <p className="text-emerald-700">✓ Your profile will go live on the platform</p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Go to Nurse Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (stage === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center space-y-5">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Interview Not Passed</h2>
              <p className="text-muted-foreground mt-2">
                Unfortunately, {nurseData?.name}, you did not meet the minimum score this time.
              </p>
            </div>
            <div className="text-sm text-left bg-muted rounded-xl p-4 space-y-1">
              <p className="font-medium">We recommend:</p>
              <p className="text-muted-foreground">• Review WHO patient care protocols</p>
              <p className="text-muted-foreground">• Study emergency response procedures</p>
              <p className="text-muted-foreground">• Re-apply after 30 days</p>
            </div>
            <Button variant="outline" onClick={() => setStage("form")} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <p className="font-bold text-sm">Nurse Onboarding</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`flex items-center gap-1 ${stage === "form" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                stage === "form" ? "bg-primary text-white" : "bg-emerald-100 text-emerald-600"
              }`}>
                {stage !== "form" ? "✓" : "1"}
              </div>
              Registration
            </div>
            <div className="h-px w-4 bg-border" />
            <div className={`flex items-center gap-1 ${stage === "interview" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                stage === "interview" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                2
              </div>
              AI Interview
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl pb-12">
        {stage === "form" && <NurseRegistrationForm onComplete={handleFormComplete} />}
        {stage === "interview" && nurseData && (
          <AIInterviewChat nurse={nurseData} onComplete={handleInterviewComplete} />
        )}
      </main>
    </div>
  )
}
