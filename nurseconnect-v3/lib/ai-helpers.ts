// ============================================================
// AI HELPER FUNCTIONS — Client-side wrappers for API routes
// All calls go through Next.js API routes (secure, server-side)
// ============================================================

export interface TriageResponse {
  message: string
  triageLevel: "low" | "medium" | "high"
  recommendation: string
  requiresNurse: boolean
  requiresEmergency: boolean
  followUpQuestions?: string[]
}

export interface SummarizeResponse {
  summary: string
  keyAlerts: string[]
  suggestedActions: string[]
  riskLevel: "low" | "medium" | "high"
  estimatedVisitDuration: string
}

export interface NurseMatchResponse {
  rankedNurseIds: string[]
  matchReason: string
  urgencyLevel: "low" | "medium" | "high"
  recommendedSpecialization: string
}

// ─── Triage a patient's symptoms ─────────────────────────────

export async function triageSymptoms(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<TriageResponse> {
  const res = await fetch("/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error("Triage service error")
  return res.json()
}

// ─── Generate AI patient summary for nurse ───────────────────

export async function generatePatientSummary(patient: {
  patientName: string
  age: number
  problem: string
  vitals?: any
  medicalHistory?: string
}): Promise<SummarizeResponse> {
  const res = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  })
  if (!res.ok) throw new Error("Summarize service error")
  return res.json()
}

// ─── AI nurse matching ────────────────────────────────────────

export async function matchNurses(
  patientProblem: string,
  patientAge: number,
  availableNurses: any[]
): Promise<NurseMatchResponse> {
  const res = await fetch("/api/nurse-match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientProblem, patientAge, availableNurses }),
  })
  if (!res.ok) throw new Error("Match service error")
  return res.json()
}
