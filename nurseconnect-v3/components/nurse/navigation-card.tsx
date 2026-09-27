"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, Clock, Route, CheckCircle2 } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function NavigationCard() {
  const { addNotification, currentNurse } = useApp()
  const [isNavigating, setIsNavigating] = useState(false)
  const [eta, setEta] = useState(8)
  const [distance, setDistance] = useState(2.3)
  const [nursePosition, setNursePosition] = useState({ x: 40, y: 180 })

  // Simulate navigation progress
  useEffect(() => {
    if (isNavigating && eta > 0) {
      const interval = setInterval(() => {
        setEta(prev => Math.max(0, prev - 1))
        setDistance(prev => Math.max(0, Number((prev - 0.3).toFixed(1))))
        setNursePosition(prev => ({
          x: Math.min(280, prev.x + 30),
          y: Math.max(40, prev.y - 17)
        }))
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isNavigating, eta])

  const handleStartNavigation = () => {
    setIsNavigating(true)
    addNotification({
      type: "info",
      title: "Navigation Started",
      message: "Follow the route to reach the patient.",
    })
  }

  const handleCallPatient = () => {
    addNotification({
      type: "info",
      title: "Calling Patient",
      message: "Connecting to Rajesh Kumar...",
    })
  }

  const handleArrived = () => {
    setIsNavigating(false)
    addNotification({
      type: "success",
      title: "You Have Arrived",
      message: "Patient has been notified of your arrival.",
    })
  }

  if (!currentNurse?.isOnDuty) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Navigation className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-1">Navigation Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            Accept a patient request to enable navigation.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Live Navigation
          </CardTitle>
          {isNavigating && (
            <Badge className="bg-green-100 text-green-700 border-0">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map */}
        <div className="relative h-48 rounded-xl bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-50">
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <defs>
                <pattern id="nav-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#nav-grid)" />
            </svg>
            
            <svg className="absolute inset-0 w-full h-full">
              {/* Route line */}
              <path
                d="M 40 180 Q 80 140 100 120 T 160 80 T 220 50 T 280 40"
                fill="none"
                stroke="rgb(20, 184, 166)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={isNavigating ? "none" : "8,4"}
                className={isNavigating ? "" : "animate-pulse"}
              />

              {/* Nurse location marker - animated */}
              <g style={{ transform: `translate(${nursePosition.x}px, ${nursePosition.y}px)` }} className="transition-transform duration-1000">
                <circle cx="0" cy="0" r="12" className="fill-primary" />
                <circle cx="0" cy="0" r="18" className="fill-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                <text x="0" y="4" textAnchor="middle" className="fill-primary-foreground text-[10px] font-bold">You</text>
              </g>

              {/* Destination marker */}
              <g>
                <circle cx="280" cy="40" r="12" className="fill-red-500" />
                <MapPin x="272" y="28" className="h-5 w-5 text-white" />
              </g>
            </svg>
          </div>

          {/* ETA overlay */}
          <div className="absolute bottom-3 right-3 bg-card/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-bold">{eta} min</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Route className="h-4 w-4" />
                <span className="text-sm font-medium">{distance} km</span>
              </div>
            </div>
          </div>

          {eta === 0 && isNavigating && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="bg-card rounded-lg px-4 py-3 shadow-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">You have arrived!</span>
              </div>
            </div>
          )}
        </div>

        {/* Destination Info */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
          <MapPin className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">42, Lajpat Nagar</p>
            <p className="text-xs text-muted-foreground">Near Metro Station, New Delhi - 110024</p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isNavigating ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCallPatient}>
              <Phone className="h-4 w-4 mr-2" />
              Call Patient
            </Button>
            <Button className="flex-1" onClick={handleStartNavigation}>
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          </div>
        ) : eta > 0 ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCallPatient}>
              <Phone className="h-4 w-4 mr-2" />
              Call Patient
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => setIsNavigating(false)}>
              End Navigation
            </Button>
          </div>
        ) : (
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleArrived}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirm Arrival
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
