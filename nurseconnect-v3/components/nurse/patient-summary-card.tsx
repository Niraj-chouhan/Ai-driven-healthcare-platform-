"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Sparkles,
  ThermometerSun,
  Heart,
  Activity,
  CheckCircle2,
  X,
  Navigation
} from "lucide-react"
import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"

// Demo patient requests that will come in
const demoRequests = [
  {
    id: "REQ-001",
    patientId: "PAT-001",
    name: "Rajesh Kumar",
    age: 65,
    gender: "Male",
    phone: "+91 98765 43210",
    address: "42, Lajpat Nagar, New Delhi",
    distance: "2.3 km",
    eta: "8 mins",
    riskLevel: "high" as const,
    chiefComplaints: ["Chest Pain", "Shortness of Breath", "Dizziness"],
    vitals: {
      temperature: "99.2°F",
      heartRate: "98 bpm",
      bp: "160/95 mmHg"
    },
    aiSummary: "65-year-old male presenting with acute chest discomfort and dyspnea. Recommend immediate cardiac assessment. Patient has history of hypertension.",
    status: "pending" as const,
    createdAt: new Date(),
  },
  {
    id: "REQ-002",
    patientId: "PAT-002",
    name: "Sunita Devi",
    age: 45,
    gender: "Female",
    phone: "+91 98765 43211",
    address: "15, Saket, New Delhi",
    distance: "3.1 km",
    eta: "12 mins",
    riskLevel: "medium" as const,
    chiefComplaints: ["Fever", "Body Aches", "Fatigue"],
    vitals: {
      temperature: "101.5°F",
      heartRate: "88 bpm",
      bp: "120/80 mmHg"
    },
    aiSummary: "45-year-old female with persistent fever for 2 days. Likely viral infection. Recommend hydration and monitoring.",
    status: "pending" as const,
    createdAt: new Date(),
  },
]

export function PatientSummaryCard() {
  const { currentNurse, addNotification, updateRequest } = useApp()
  const [currentRequest, setCurrentRequest] = useState(demoRequests[0])
  const [requestStatus, setRequestStatus] = useState<"pending" | "accepted" | "declined" | "none">("pending")
  const [requestIndex, setRequestIndex] = useState(0)

  const isOnDuty = currentNurse?.isOnDuty ?? false

  // Simulate new request coming in when nurse goes on duty
  useEffect(() => {
    if (isOnDuty && requestStatus === "none") {
      const timer = setTimeout(() => {
        setCurrentRequest(demoRequests[requestIndex % demoRequests.length])
        setRequestStatus("pending")
        addNotification({
          type: "warning",
          title: "New Patient Request!",
          message: `${demoRequests[requestIndex % demoRequests.length].name} needs assistance.`,
        })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnDuty, requestStatus, requestIndex, addNotification])

  const getRiskConfig = (level: string) => {
    switch (level) {
      case "high":
        return { 
          color: "bg-red-500", 
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "HIGH RISK" 
        }
      case "medium":
        return { 
          color: "bg-amber-500", 
          textColor: "text-amber-700",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          label: "MEDIUM RISK" 
        }
      default:
        return { 
          color: "bg-green-500", 
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          label: "LOW RISK" 
        }
    }
  }

  const handleAccept = () => {
    setRequestStatus("accepted")
    updateRequest(currentRequest.id, {
      status: "accepted",
      acceptedNurseId: currentNurse?.id,
    })
    addNotification({
      type: "success",
      title: "Request Accepted",
      message: `You are now assigned to ${currentRequest.name}. Navigate to start.`,
    })
  }

  const handleDecline = () => {
    setRequestStatus("none")
    setRequestIndex(prev => prev + 1)
    addNotification({
      type: "info",
      title: "Request Declined",
      message: "Request has been passed to another nurse.",
    })
  }

  const handleComplete = () => {
    updateRequest(currentRequest.id, {
      status: "completed",
      acceptedNurseId: currentNurse?.id,
    })
    setRequestStatus("none")
    setRequestIndex(prev => prev + 1)
    addNotification({
      type: "success",
      title: "Visit Completed!",
      message: `Visit to ${currentRequest.name} marked as complete. Great job!`,
    })
  }

  const handleCall = () => {
    addNotification({
      type: "info",
      title: "Calling Patient",
      message: `Connecting to ${currentRequest.name}...`,
    })
  }

  if (!isOnDuty) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-1">You&apos;re Off Duty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Turn on your duty status to start receiving patient requests.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (requestStatus === "none") {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-1">No Active Requests</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            You&apos;re online and ready. New patient requests will appear here.
          </p>
          <div className="flex items-center gap-2 mt-4 text-primary">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span className="text-sm font-medium">Waiting for requests...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const riskConfig = getRiskConfig(currentRequest.riskLevel)

  return (
    <Card className={`${riskConfig.borderColor} border-2 overflow-hidden`}>
      {/* Risk Header */}
      <div className={`${riskConfig.color} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">{riskConfig.label}</span>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Triage
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{currentRequest.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentRequest.age} yrs, {currentRequest.gender}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{currentRequest.distance}</p>
            <p className="text-xs text-muted-foreground">ETA: {currentRequest.eta}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chief Complaints */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">CHIEF COMPLAINTS</p>
          <div className="flex flex-wrap gap-2">
            {currentRequest.chiefComplaints.map((complaint, index) => (
              <Badge key={index} variant="outline" className={`${riskConfig.bgColor} ${riskConfig.textColor} border-0`}>
                {complaint}
              </Badge>
            ))}
          </div>
        </div>

        {/* Vitals */}
        {currentRequest.vitals && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-muted text-center">
              <ThermometerSun className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Temp</p>
              <p className="text-sm font-semibold">{currentRequest.vitals.temperature}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted text-center">
              <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Heart Rate</p>
              <p className="text-sm font-semibold">{currentRequest.vitals.heartRate}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted text-center">
              <Activity className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">BP</p>
              <p className="text-sm font-semibold">{currentRequest.vitals.bp}</p>
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className={`p-3 rounded-lg ${riskConfig.bgColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`h-4 w-4 ${riskConfig.textColor}`} />
            <span className={`text-xs font-semibold ${riskConfig.textColor}`}>AI ASSESSMENT</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{currentRequest.aiSummary}</p>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-muted-foreground">{currentRequest.address}</span>
        </div>

        {/* Action Buttons */}
        {requestStatus === "pending" ? (
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDecline}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAccept}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept Request
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleCall}>
                <Phone className="h-4 w-4 mr-2" />
                Call Patient
              </Button>
              <Button className="flex-1">
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </Button>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleComplete}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Visit Complete
            </Button>
          </>
        )}

        {requestStatus === "accepted" && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-50 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Request Accepted - Patient notified</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
