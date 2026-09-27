import { Users, Stethoscope, Globe, Heart } from "lucide-react"

const stats = [
  {
    icon: Heart,
    value: "1:1,457",
    label: "Doctor-Patient Gap Bridged",
    description: "Connecting underserved communities",
  },
  {
    icon: Users,
    value: "50,000+",
    label: "Verified Nurses Ready",
    description: "Available across India",
  },
  {
    icon: Globe,
    value: "10+",
    label: "Languages Supported",
    description: "Including Hindi, Tamil, Bengali",
  },
  {
    icon: Stethoscope,
    value: "24/7",
    label: "AI Health Support",
    description: "Always available for you",
  },
]

export function StatsFooter() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-balance">Making Healthcare Accessible for Everyone</h2>
          <p className="text-primary-foreground/80 mt-2">Trusted by millions across India</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="font-medium text-sm">{stat.label}</div>
              <div className="text-xs text-primary-foreground/70 mt-1">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 pt-8 border-t border-primary-foreground/20">
          <p className="text-sm text-primary-foreground/70">
            © 2024 Digital Savers. Your health, our priority.
          </p>
        </div>
      </div>
    </footer>
  )
}
