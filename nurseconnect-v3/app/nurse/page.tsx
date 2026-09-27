import { NurseHeader } from "@/components/nurse/nurse-header"
import { PatientSummaryCard } from "@/components/nurse/patient-summary-card"
import { NavigationCard } from "@/components/nurse/navigation-card"
import { EarningsDashboard } from "@/components/nurse/earnings-dashboard"

export default function NursePanelPage() {
  return (
    <div className="min-h-screen bg-background">
      <NurseHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Patient & Navigation */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Active Request</h2>
              <PatientSummaryCard />
            </div>
            <NavigationCard />
          </div>
          
          {/* Right Column - Earnings */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Earnings & Performance</h2>
            <EarningsDashboard />
          </div>
        </div>
      </main>
    </div>
  )
}
