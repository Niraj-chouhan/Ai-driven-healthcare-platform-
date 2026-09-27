"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  IndianRupee, 
  TrendingUp, 
  Star, 
  Clock, 
  CheckCircle2,
  Calendar,
  Wallet,
  ArrowRight
} from "lucide-react"
import { useApp } from "@/lib/app-context"

const initialShiftHistory = [
  {
    id: 1,
    patientName: "Priya Sharma",
    type: "Home Visit",
    time: "10:30 AM",
    amount: 350,
    rating: 5,
    status: "completed"
  },
  {
    id: 2,
    patientName: "Amit Verma",
    type: "Wound Dressing",
    time: "9:15 AM",
    amount: 250,
    rating: 4,
    status: "completed"
  },
  {
    id: 3,
    patientName: "Sunita Devi",
    type: "Injection",
    time: "8:00 AM",
    amount: 200,
    rating: 5,
    status: "completed"
  }
]

export function EarningsDashboard() {
  const { currentNurse, addNotification } = useApp()
  const [shiftHistory] = useState(initialShiftHistory)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const todaysEarnings = currentNurse?.earnings || 800
  const todaysVisits = currentNurse?.visitsToday || 3
  const avgRating = 4.8
  const weeklyEarnings = 4850
  const weeklyVisits = 18

  const handleWithdraw = () => {
    setShowWithdraw(true)
    addNotification({
      type: "success",
      title: "Withdrawal Initiated",
      message: `Rs. ${todaysEarnings} will be transferred to your account within 24 hours.`,
    })
    setTimeout(() => setShowWithdraw(false), 3000)
  }

  const handleViewDetails = (visit: typeof shiftHistory[0]) => {
    addNotification({
      type: "info",
      title: visit.patientName,
      message: `${visit.type} - Rs. ${visit.amount} earned at ${visit.time}`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Today&apos;s Earnings</p>
                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{todaysEarnings}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">+15% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Visits Today</p>
                <p className="text-2xl font-bold text-foreground mt-1">{todaysVisits}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">{avgRating} avg rating</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Button */}
      <Button 
        className="w-full" 
        variant="outline"
        onClick={handleWithdraw}
        disabled={showWithdraw || todaysEarnings === 0}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {showWithdraw ? "Processing..." : `Withdraw Rs. ${todaysEarnings}`}
      </Button>

      {/* Shift History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today&apos;s Shift History
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {shiftHistory.length} visits
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shiftHistory.map((visit) => (
              <div 
                key={visit.id} 
                onClick={() => handleViewDetails(visit)}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{visit.patientName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{visit.type}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{visit.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 text-foreground font-semibold">
                      <IndianRupee className="h-3.5 w-3.5" />
                      <span>{visit.amount}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: visit.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Summary */}
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold text-foreground">{weeklyEarnings.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  {weeklyVisits} Visits
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">4.9 avg rating</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
