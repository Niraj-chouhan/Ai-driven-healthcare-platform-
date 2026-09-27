"use client"

import { Button } from "@/components/ui/button"
import { Heart, Bell, User, Menu } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Digital Savers</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">AI Healthcare Concierge</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Patient Dashboard
            </a>
            <a href="/nurse" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Nurse Portal
            </a>
            <a href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Admin Panel
            </a>
            <a href="/vetting" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              🛡️ NurseVet AI
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative hidden sm:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              <a href="/" className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg">
                Patient Dashboard
              </a>
              <a href="/nurse" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                Nurse Portal
              </a>
              <a href="/admin" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                Admin Panel
              </a>
              <a href="/vetting" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                🛡️ NurseVet AI
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
