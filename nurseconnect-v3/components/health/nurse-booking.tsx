"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, ShieldCheck, Star, Users, Check, Phone, Navigation, Loader2 } from "lucide-react"
import { useApp } from "@/lib/app-context"

const nearbyNurses = [
  { id: "n1", name: "Priya S.", rating: 4.9, eta: 8, specialty: "General Care", verified: true, phone: "+91 98765 00001" },
  { id: "n2", name: "Rajesh K.", rating: 4.8, eta: 12, specialty: "Elder Care", verified: true, phone: "+91 98765 00002" },
  { id: "n3", name: "Anita M.", rating: 4.9, eta: 15, specialty: "Pediatric", verified: true, phone: "+91 98765 00003" },
]

export function NurseBooking() {
  const { booking, addNotification } = useApp()
  const [selectedNurseId, setSelectedNurseId] = useState<string | null>(null)
  const [bookingStatus, setBookingStatus] = useState<"idle" | "booking" | "confirmed" | "arriving">("idle")
  const [confirmedNurse, setConfirmedNurse] = useState<typeof nearbyNurses[0] | null>(null)

  const handleSelectNurse = (nurseId: string) => {
    setSelectedNurseId(nurseId)
  }

  const handleBookNurse = async () => {
    if (!selectedNurseId) {
      // Book nearest if none selected
      setSelectedNurseId(nearbyNurses[0].id)
    }
    
    const nurse = nearbyNurses.find(n => n.id === (selectedNurseId || nearbyNurses[0].id))
    if (!nurse) return

    setBookingStatus("booking")
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setBookingStatus("confirmed")
    setConfirmedNurse(nurse)
    
    addNotification({
      type: "success",
      title: "Nurse Booked Successfully!",
      message: `${nurse.name} will arrive in ${nurse.eta} minutes.`,
    })

    // Simulate nurse starting journey
    setTimeout(() => {
      setBookingStatus("arriving")
      addNotification({
        type: "info",
        title: "Nurse On The Way",
        message: `${nurse.name} has started the journey to your location.`,
      })
    }, 3000)
  }

  const handleCallNurse = () => {
    if (confirmedNurse) {
      addNotification({
        type: "info",
        title: "Calling Nurse",
        message: `Connecting you to ${confirmedNurse.name}...`,
      })
    }
  }

  const handleTrackNurse = () => {
    addNotification({
      type: "info",
      title: "Live Tracking",
      message: "Opening live location tracking...",
    })
  }

  if (bookingStatus === "confirmed" || bookingStatus === "arriving") {
    return (
      <Card className="shadow-lg border-2 border-green-500/30 bg-green-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-green-700">
              <Check className="h-5 w-5" />
              Nurse Booked!
            </CardTitle>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {bookingStatus === "arriving" ? "On The Way" : "Confirmed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confirmed Nurse Card */}
          {confirmedNurse && (
            <div className="p-4 rounded-xl border border-green-200 bg-white">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {confirmedNurse.name.split(" ")[0][0]}
                    {confirmedNurse.name.split(" ")[1][0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{confirmedNurse.name}</span>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {confirmedNurse.rating}
                    </span>
                    <span>{confirmedNurse.specialty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{confirmedNurse.eta}</div>
                  <div className="text-xs text-muted-foreground">min ETA</div>
                </div>
              </div>
            </div>
          )}

          {/* Live Map */}
          <div className="relative rounded-xl overflow-hidden bg-muted h-40">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-primary/10">
              <svg className="w-full h-full" viewBox="0 0 400 160">
                <defs>
                  <pattern id="grid-booked" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/10" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-booked)" />
                
                {/* Animated route line */}
                <path 
                  d="M 320 120 Q 280 100 240 80 T 160 50 T 80 40" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                  className="text-green-500"
                  strokeDasharray="8,4"
                />
                
                {/* User location */}
                <circle cx="80" cy="40" r="12" className="fill-primary" />
                <text x="80" y="44" textAnchor="middle" className="fill-primary-foreground text-xs font-bold">You</text>
                
                {/* Nurse location - animated */}
                <g className={bookingStatus === "arriving" ? "animate-pulse" : ""}>
                  <circle cx="320" cy="120" r="10" className="fill-green-500" />
                  <text x="320" y="124" textAnchor="middle" className="fill-white text-[10px] font-bold">N</text>
                </g>
              </svg>
            </div>
            
            {bookingStatus === "arriving" && (
              <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                Live Tracking
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCallNurse}>
              <Phone className="h-4 w-4 mr-2" />
              Call Nurse
            </Button>
            <Button className="flex-1" onClick={handleTrackNurse}>
              <Navigation className="h-4 w-4 mr-2" />
              Track Live
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-2 border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Book a Verified Nurse
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Verified & Safe
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Placeholder */}
        <div className="relative rounded-xl overflow-hidden bg-muted h-40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20">
            <svg className="w-full h-full" viewBox="0 0 400 160">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/10" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <path d="M 0 80 L 400 80" stroke="currentColor" strokeWidth="3" className="text-primary/20" />
              <path d="M 200 0 L 200 160" stroke="currentColor" strokeWidth="3" className="text-primary/20" />
              
              <circle cx="200" cy="80" r="12" className="fill-primary" />
              <circle cx="200" cy="80" r="20" className="fill-primary/20" />
              <text x="200" y="84" textAnchor="middle" className="fill-primary-foreground text-xs font-bold">You</text>
              
              <g className={selectedNurseId === "n1" ? "animate-pulse" : ""}>
                <circle cx="150" cy="50" r="8" className={selectedNurseId === "n1" ? "fill-green-500" : "fill-emerald-500"} />
                <text x="150" y="54" textAnchor="middle" className="fill-white text-[8px] font-bold">N</text>
              </g>
              <g className={selectedNurseId === "n2" ? "animate-pulse" : ""}>
                <circle cx="280" cy="100" r="8" className={selectedNurseId === "n2" ? "fill-green-500" : "fill-emerald-500"} />
                <text x="280" y="104" textAnchor="middle" className="fill-white text-[8px] font-bold">N</text>
              </g>
              <g className={selectedNurseId === "n3" ? "animate-pulse" : ""}>
                <circle cx="120" cy="120" r="8" className={selectedNurseId === "n3" ? "fill-green-500" : "fill-emerald-500"} />
                <text x="120" y="124" textAnchor="middle" className="fill-white text-[8px] font-bold">N</text>
              </g>
            </svg>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-card/95 backdrop-blur rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">3 Nurses nearby</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Fastest: 8 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nurse List */}
        <div className="space-y-2">
          {nearbyNurses.map((nurse, index) => (
            <div
              key={nurse.id}
              onClick={() => handleSelectNurse(nurse.id)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                selectedNurseId === nurse.id 
                  ? "border-green-500 bg-green-50 ring-2 ring-green-500/20" 
                  : index === 0 && !selectedNurseId
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10" 
                    : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  selectedNurseId === nurse.id ? "bg-green-100" : "bg-primary/10"
                }`}>
                  <span className={`text-sm font-semibold ${selectedNurseId === nurse.id ? "text-green-600" : "text-primary"}`}>
                    {nurse.name.split(" ")[0][0]}
                    {nurse.name.split(" ")[1][0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{nurse.name}</span>
                    {nurse.verified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    )}
                    {selectedNurseId === nurse.id && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Selected</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {nurse.rating}
                    </span>
                    <span>•</span>
                    <span>{nurse.specialty}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${selectedNurseId === nurse.id ? "text-green-600" : "text-primary"}`}>
                  {nurse.eta} min
                </div>
                <div className="text-xs text-muted-foreground">ETA</div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleBookNurse}
          disabled={bookingStatus === "booking"}
        >
          {bookingStatus === "booking" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              {selectedNurseId ? "Book Selected Nurse" : "Book Nearest Nurse"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
