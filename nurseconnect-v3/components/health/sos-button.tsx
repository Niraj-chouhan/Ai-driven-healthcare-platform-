"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone, Users, X, Loader2 } from "lucide-react"

export function SOSButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTriggered, setIsTriggered] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (isTriggered && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [isTriggered, countdown])

  const handleSOS = () => {
    setIsOpen(true)
  }

  const handleConfirm = () => {
    setIsTriggered(true)
    // Reset after animation
    setTimeout(() => {
      setIsTriggered(false)
      setIsOpen(false)
      setCountdown(5)
    }, 6000)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setIsTriggered(false)
    setCountdown(5)
  }

  return (
    <>
      {/* Floating SOS Button */}
      <Button
        onClick={handleSOS}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 z-50 animate-pulse hover:animate-none transition-all"
        aria-label="Emergency SOS"
      >
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-0.5">SOS</span>
        </div>
      </Button>

      {/* SOS Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {!isTriggered ? (
              <>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Emergency SOS</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    This will immediately call emergency services and notify your emergency contacts.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleConfirm}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Confirm Emergency
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="relative h-20 w-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-red-100 animate-ping" />
                  <div className="relative h-20 w-20 rounded-full bg-red-600 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  {countdown > 0 ? `Activating in ${countdown}...` : "Help is on the way!"}
                </h2>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className={`h-4 w-4 ${countdown <= 3 ? "text-emerald-500" : ""}`} />
                    <span className={countdown <= 3 ? "text-emerald-600 font-medium" : ""}>
                      {countdown <= 3 ? "Calling Ambulance..." : "Preparing emergency call..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className={`h-4 w-4 ${countdown <= 1 ? "text-emerald-500" : ""}`} />
                    <span className={countdown <= 1 ? "text-emerald-600 font-medium" : ""}>
                      {countdown <= 1 ? "Family notified!" : "Notifying emergency contacts..."}
                    </span>
                  </div>
                </div>

                {countdown > 0 && (
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="mt-4"
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
