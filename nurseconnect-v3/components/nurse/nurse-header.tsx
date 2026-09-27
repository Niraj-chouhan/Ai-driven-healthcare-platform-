"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Heart, Bell, User, Settings, Home, IndianRupee } from "lucide-react"
import { useApp } from "@/lib/app-context"
import Link from "next/link"

export function NurseHeader() {
  const { currentNurse, setNurseOnDuty, addNotification, nurseRequests } = useApp()
  
  const isOnDuty = currentNurse?.isOnDuty ?? false
  const pendingRequests = nurseRequests.filter(r => r.status === "pending").length

  const handleDutyToggle = (checked: boolean) => {
    setNurseOnDuty(checked)
    addNotification({
      type: checked ? "success" : "info",
      title: checked ? "You are now On Duty" : "You are now Off Duty",
      message: checked 
        ? "You will start receiving patient requests." 
        : "You will not receive new patient requests.",
    })
  }

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Digital Savers</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Nurse Portal</p>
            </div>
          </Link>

          {/* Duty Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <span className="text-sm font-medium text-muted-foreground">Duty</span>
              <Switch
                checked={isOnDuty}
                onCheckedChange={handleDutyToggle}
                aria-label="Toggle duty status"
              />
              {isOnDuty ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  ON
                </span>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">OFF</span>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Earnings Quick View */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
              <IndianRupee className="h-4 w-4" />
              <span className="font-semibold">{currentNurse?.earnings || 0}</span>
              <span className="text-xs text-primary/70">today</span>
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingRequests > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500">
                  {pendingRequests}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
            <Link href="/">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
