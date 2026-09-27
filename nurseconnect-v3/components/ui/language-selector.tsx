"use client"

import { Globe2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { INTERVIEW_LANGUAGES } from "@/components/vetting/interview-voice-recorder"

interface LanguageSelectorProps {
  value: string
  onChange: (code: string) => void
  compact?: boolean
}

export function LanguageSelector({ value, onChange, compact = false }: LanguageSelectorProps) {
  const selected = INTERVIEW_LANGUAGES.find(l => l.code === value) ?? INTERVIEW_LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"} className="gap-1.5 text-xs">
          <Globe2 className="h-3.5 w-3.5" />
          <span>{selected.flag} {compact ? selected.label.split(" ")[0] : selected.label}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 max-h-72 overflow-y-auto">
        {INTERVIEW_LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`text-sm gap-2 ${value === lang.code ? "bg-primary/10 font-medium" : ""}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
