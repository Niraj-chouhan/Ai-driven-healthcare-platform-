"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Activity, Pill, Calendar } from "lucide-react"

const MOCK_RECORDS = [
  { id: "1", date: "Apr 20, 2026", type: "Visit", nurse: "Priya S.", notes: "Blood pressure check — 120/80, normal", status: "completed" },
  { id: "2", date: "Apr 15, 2026", type: "Injection", nurse: "Rajesh K.", notes: "Vitamin B12 injection administered", status: "completed" },
  { id: "3", date: "Apr 10, 2026", type: "Wound Care", nurse: "Anita M.", notes: "Wound dressing changed, healing well", status: "completed" },
]

export function HealthRecordsMini() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Health Records</h2>
        <p className="text-sm text-muted-foreground">Your recent nurse visits and care history</p>
      </div>

      <div className="space-y-3">
        {MOCK_RECORDS.map(r => (
          <Card key={r.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{r.type}</p>
                      <Badge variant="secondary" className="text-xs">by {r.nurse}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{r.notes}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {r.date}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs shrink-0">
                  ✓ Done
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          <Activity className="h-6 w-6 mx-auto mb-1 opacity-40" />
          More records will appear here after nurse visits
        </CardContent>
      </Card>
    </div>
  )
}
