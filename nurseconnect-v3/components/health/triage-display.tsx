"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, AlertCircle, ArrowRight, Activity, Sparkles } from "lucide-react"
import { useApp } from "@/lib/app-context"

type RiskLevel = "low" | "medium" | "high" | null

interface TriageResult {
  level: RiskLevel
  title: string
  description: string
  nextSteps: string[]
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  textColor: string
}

const triageResults: Record<Exclude<RiskLevel, null>, TriageResult> = {
  low: {
    level: "low",
    title: "LOW Risk - Green Zone",
    description: "Your symptoms suggest a minor condition that can be managed at home with self-care.",
    nextSteps: [
      "Rest and stay hydrated",
      "Take over-the-counter medication if needed",
      "Monitor symptoms for 24-48 hours",
      "Contact a nurse if symptoms worsen",
    ],
    icon: <CheckCircle className="h-8 w-8" />,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-700",
  },
  medium: {
    level: "medium",
    title: "MEDIUM Risk - Yellow Zone",
    description: "Your symptoms require professional attention. Please consult a healthcare provider within 24 hours.",
    nextSteps: [
      "Schedule a consultation within 24 hours",
      "Prepare a list of your symptoms",
      "Have your medical history ready",
      "Book a verified nurse visit",
    ],
    icon: <AlertCircle className="h-8 w-8" />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-500",
    textColor: "text-amber-700",
  },
  high: {
    level: "high",
    title: "HIGH Risk - Red Zone",
    description: "Your symptoms indicate a potentially serious condition. Seek immediate medical attention.",
    nextSteps: [
      "Call emergency services immediately",
      "Do not drive yourself",
      "Keep calm and stay seated",
      "Someone is being notified now",
    ],
    icon: <AlertTriangle className="h-8 w-8" />,
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    textColor: "text-red-700",
  },
}

export function TriageDisplay() {
  const { triageLevel, addNotification, startBooking } = useApp()

  const result = triageLevel ? triageResults[triageLevel] : null

  const handleBookNurse = () => {
    // Create a mock patient request
    const request = {
      id: `REQ-${Date.now()}`,
      patientId: "PAT-001",
      name: "Current User",
      age: 45,
      gender: "Male",
      phone: "+91 98765 43210",
      address: "Your Location, Delhi NCR",
      distance: "2.1 km",
      eta: "10 mins",
      riskLevel: triageLevel as "low" | "medium" | "high",
      chiefComplaints: triageLevel === "high" ? ["Chest Pain", "Shortness of Breath"] : 
                       triageLevel === "medium" ? ["Fever", "Body Aches"] : 
                       ["Headache", "Mild Discomfort"],
      vitals: {
        temperature: "99.2°F",
        heartRate: "88 bpm",
        bp: "130/85 mmHg"
      },
      aiSummary: `Patient presenting with ${triageLevel} risk symptoms. AI triage suggests ${
        triageLevel === "high" ? "immediate attention required" : 
        triageLevel === "medium" ? "consultation within 24 hours" : 
        "self-care with monitoring"
      }.`,
      status: "pending" as const,
      createdAt: new Date(),
    }
    
    startBooking(request)
    addNotification({
      type: "success",
      title: "Booking Initiated",
      message: "Finding nearby nurses for you...",
    })
  }

  const handleEmergency = () => {
    addNotification({
      type: "error",
      title: "Emergency Services Contacted",
      message: "Help is on the way. Stay calm.",
    })
  }

  if (!result) {
    return (
      <Card className="shadow-lg border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            AI Triage Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No Assessment Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start chatting with our AI Health Assistant to receive a personalized triage assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          AI Triage Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Result Display */}
        <div
          className={`rounded-xl p-5 border-2 ${result.bgColor} ${result.borderColor} transition-all duration-300 animate-in fade-in-50`}
        >
          <div className="flex items-start gap-4">
            <div className={`${result.textColor} shrink-0`}>{result.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-xl ${result.textColor}`}>{result.title}</h3>
              <p className="text-foreground/80 mt-1 text-sm leading-relaxed">{result.description}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-current/10">
            <h4 className="font-semibold text-sm text-foreground mb-2">Recommended Next Steps:</h4>
            <ul className="space-y-2">
              {result.nextSteps.map((step, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                  <ArrowRight className={`h-4 w-4 shrink-0 ${result.textColor}`} />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {result.level !== "high" && (
            <Button className="w-full mt-4" size="lg" onClick={handleBookNurse}>
              {result.level === "low" ? "Chat with Nurse" : "Book Consultation Now"}
            </Button>
          )}

          {result.level === "high" && (
            <Button variant="destructive" className="w-full mt-4" size="lg" onClick={handleEmergency}>
              Call Emergency Services
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
