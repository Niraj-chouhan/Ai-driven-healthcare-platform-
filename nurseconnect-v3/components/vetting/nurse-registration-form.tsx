"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, Upload, FileCheck, AlertCircle, X, Plus, ChevronRight } from "lucide-react"

const ALL_SPECIALIZATIONS = [
  "ICU / Critical Care",
  "General Nursing",
  "Pediatrics",
  "Elder Care",
  "Emergency / Trauma",
  "Neonatal (NICU)",
  "Oncology",
  "Physiotherapy",
  "Wound Care",
  "Dialysis",
  "Injections & IV",
  "Post-Operative Care",
]

interface NurseRegistrationFormProps {
  onComplete: (data: NurseFormData) => void
}

export interface NurseFormData {
  name: string
  email: string
  phone: string
  specializations: string[]
  experienceYears: number
  fullAddress: string
  city: string
  cvFileName: string
}

export function NurseRegistrationForm({ onComplete }: NurseRegistrationFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("+91 ")
  const [specializations, setSpecializations] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [fullAddress, setFullAddress] = useState("")
  const [city, setCity] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSpecPicker, setShowSpecPicker] = useState(false)

  function toggleSpec(spec: string) {
    setSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }

  function handleSubmit() {
    setError(null)
    if (!name.trim()) return setError("Please enter your full name")
    if (!email.includes("@")) return setError("Please enter a valid Gmail/email")
    if (phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid phone number")
    if (specializations.length === 0) return setError("Please select at least one specialization")
    if (!experience || isNaN(Number(experience))) return setError("Please enter years of experience")
    if (!fullAddress.trim()) return setError("Please enter your full address")
    if (!city.trim()) return setError("Please enter your city")
    if (!cvFile) return setError("Please upload your CV / resume")
    if (!agreed) return setError("Please agree to the terms")

    onComplete({
      name, email, phone, specializations,
      experienceYears: Number(experience),
      fullAddress, city,
      cvFileName: cvFile.name,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Nurse Registration</h2>
        <p className="text-sm text-muted-foreground">All fields required. Your credentials will be AI-vetted.</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma" />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 00000" />
          </div>
          <div className="space-y-1.5">
            <Label>Gmail *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@gmail.com" />
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-1.5">
          <Label>Specializations * (select all that apply)</Label>
          <div className="border rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {specializations.length === 0 && (
                <p className="text-sm text-muted-foreground">No specializations selected</p>
              )}
              {specializations.map(s => (
                <Badge key={s} className="gap-1 bg-primary/10 text-primary border-primary/20">
                  {s}
                  <button onClick={() => toggleSpec(s)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowSpecPicker(!showSpecPicker)}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              <Plus className="h-3 w-3" />
              {showSpecPicker ? "Hide" : "Add specializations"}
            </button>
            {showSpecPicker && (
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t">
                {ALL_SPECIALIZATIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpec(s)}
                    className={`text-xs px-2 py-1.5 rounded-md border text-left transition-colors ${
                      specializations.includes(s)
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-white border-border hover:border-primary/30"
                    }`}
                  >
                    {specializations.includes(s) ? "✓ " : ""}{s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-1.5">
          <Label>Years of Experience *</Label>
          <Input
            type="number"
            min="0"
            max="50"
            value={experience}
            onChange={e => setExperience(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label>Full Address (for matching) *</Label>
          <Textarea
            value={fullAddress}
            onChange={e => setFullAddress(e.target.value)}
            placeholder="House/Flat no., Street, Locality, District..."
            className="resize-none"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label>City *</Label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Khargone, Bhopal" />
        </div>

        {/* CV Upload */}
        <div className="space-y-1.5">
          <Label>CV / Resume *</Label>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={e => setCvFile(e.target.files?.[0] || null)}
            />
            {cvFile ? (
              <>
                <FileCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-emerald-700 font-medium">{cvFile.name}</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Upload CV (PDF, DOC) — Max 5MB</span>
              </>
            )}
          </label>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <Label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
            I confirm all information is accurate and agree to the AI vetting interview that follows registration
          </Label>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button className="w-full" size="lg" onClick={handleSubmit}>
          <ShieldCheck className="h-4 w-4 mr-2" />
          Submit & Start AI Interview
        </Button>
      </div>
    </div>
  )
}
