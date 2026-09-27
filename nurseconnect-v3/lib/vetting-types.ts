// ============================================================
// NURSE VETTING & PATIENT MATCHING — STRICT TYPESCRIPT TYPES
// Stack: Next.js 16 + React 19 + TypeScript + Zod
// ============================================================

import { z } from "zod"

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const SpecializationEnum = z.enum(["ICU", "General", "Pediatrics", "Elder Care", "Emergency"])
export type Specialization = z.infer<typeof SpecializationEnum>

export const InterviewStatusEnum = z.enum(["Pending", "In-Progress", "Qualified", "Rejected"])
export type InterviewStatus = z.infer<typeof InterviewStatusEnum>

export const RiskLevelEnum = z.enum(["low", "medium", "high"])
export type RiskLevel = z.infer<typeof RiskLevelEnum>

export const MessageRoleEnum = z.enum(["user", "assistant", "system"])
export type MessageRole = z.infer<typeof MessageRoleEnum>

export type InterviewFlowStatus =
  | "idle"
  | "loading"
  | "questioning"
  | "evaluating"
  | "completed"
  | "failed"

// ─────────────────────────────────────────────
// ZOD SCHEMAS — No farzi data enters the system
// ─────────────────────────────────────────────

export const QualificationDocSchema = z.object({
  docId: z.string().uuid(),
  name: z.string().min(2, "Document name too short"),
  url: z.string().url("Invalid document URL"),
  verified: z.boolean().default(false),
  uploadedAt: z.date(),
})

export const AIEvaluationSchema = z.object({
  passed: z.boolean(),
  confidenceScore: z.number().min(0).max(100),
  feedback: z.string().min(10),
  criticalFailReason: z.string().optional(),
  evaluatedAt: z.date(),
})

export const InterviewMessageSchema = z.object({
  id: z.string().uuid(),
  role: MessageRoleEnum,
  content: z.string().min(1),
  timestamp: z.date(),
  questionNumber: z.number().optional(),
})

export const InterviewSessionSchema = z.object({
  sessionId: z.string().uuid(),
  nurseId: z.string(),
  messages: z.array(InterviewMessageSchema),
  currentQuestion: z.number().min(0).max(5),
  status: z.enum(["idle", "loading", "questioning", "evaluating", "completed", "failed"]),
  evaluation: AIEvaluationSchema.optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
})

// SECURITY: isVerified is READONLY from outside — only AI service sets it
export const NurseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+91\s?\d{10}$/, "Format: +91 XXXXXXXXXX"),
  specialization: SpecializationEnum,
  experienceYears: z.number().min(0).max(50),
  qualificationDocs: z.array(QualificationDocSchema).min(1),
  interviewStatus: InterviewStatusEnum,
  isVerified: z.boolean().default(false), // ONLY set by AI evaluation
  interviewScore: z.number().min(0).max(100).optional(),
  aiEvaluation: AIEvaluationSchema.optional(),
  registeredAt: z.date(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
    city: z.string(),
  }),
})

export const VettingPatientRequestSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string(),
  name: z.string().min(2),
  age: z.number().min(0).max(120),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().regex(/^\+91\s?\d{10}$/),
  address: z.string().min(5),
  distance: z.string(),
  eta: z.string(),
  riskLevel: RiskLevelEnum,
  requiredSpecialization: SpecializationEnum,
  chiefComplaints: z.array(z.string()).min(1),
  vitals: z.object({
    temperature: z.string().optional(),
    heartRate: z.string().optional(),
    bp: z.string().optional(),
  }).optional(),
  aiSummary: z.string(),
  status: z.enum(["pending", "matched", "accepted", "completed", "cancelled"]),
  matchedNurseId: z.string().optional(),
  createdAt: z.date(),
})

// Nurse Registration Form — Zod validated
export const NurseRegistrationFormSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^\+91\s?\d{10}$/, "Format: +91 XXXXXXXXXX"),
  specialization: SpecializationEnum,
  experienceYears: z
    .number({ invalid_type_error: "Enter years as number" })
    .min(0)
    .max(50),
  city: z.string().min(2, "City required"),
  address: z.string().min(10, "Full address required"),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to terms" }),
  }),
})

// ─────────────────────────────────────────────
// INFERRED TYPESCRIPT INTERFACES
// ─────────────────────────────────────────────

export type IQualificationDoc = z.infer<typeof QualificationDocSchema>
export type IAIEvaluation = z.infer<typeof AIEvaluationSchema>
export type IInterviewMessage = z.infer<typeof InterviewMessageSchema>
export type IInterviewSession = z.infer<typeof InterviewSessionSchema>
export type INurse = z.infer<typeof NurseSchema>
export type IVettingPatientRequest = z.infer<typeof VettingPatientRequestSchema>
export type NurseRegistrationFormData = z.infer<typeof NurseRegistrationFormSchema>

// ─────────────────────────────────────────────
// AI SERVICE TYPES
// ─────────────────────────────────────────────

export interface AIEvaluationResponse {
  passed: boolean
  confidenceScore: number
  feedback: string
  criticalFailReason?: string
}

export interface JobFeedFilters {
  riskLevel: RiskLevel | "all"
  specialization: Specialization | "all"
  sortBy: "newest" | "nearest" | "highest-risk"
}

// 5 Clinical questions — readonly
export const CLINICAL_QUESTIONS: readonly string[] = [
  "A patient presents with BP 80/40 mmHg, cold extremities, and altered consciousness. What is your immediate first step and which IV fluid would you administer?",
  "You must administer Heparin 5000 units IV bolus. The vial reads 10,000 units/mL. What volume (mL) do you draw, and what two safety checks do you perform before injection?",
  "A 2-year-old child (12 kg) has a temperature of 104°F. The Paracetamol syrup is 120mg/5mL. Dose is 15mg/kg. How many mL do you give, and what is the maximum daily frequency?",
  "A ventilated patient's SpO₂ drops from 98% to 82% suddenly. The ventilator alarm sounds. List your immediate assessment steps in priority order.",
  "A colleague asks you to countersign medication you did not personally administer or witness. What do you do, and what is the ethical/legal risk if you comply?",
] as const

// System Prompt for AI Medical Recruiter
export const INTERVIEW_SYSTEM_PROMPT = `You are Dr. Meera Krishnan, a Senior Medical Recruiter and Clinical Quality Assessor for a verified home healthcare platform in India.

You are conducting a strict AI-based clinical interview to vet nursing candidates.

RULES YOU MUST FOLLOW:
1. After each nurse answer, respond with a brief 1-2 line acknowledgment only. Do NOT reveal scoring yet.
2. If the nurse gives a CRITICALLY WRONG answer (wrong drug dosage that could harm a patient, unsafe medical advice, or clear ethical violation), respond ONLY with: CRITICAL_FAIL: [specific reason]
3. After receiving the message "EVALUATE_NOW", you must output ONLY a valid JSON object — no extra text whatsoever:
{"passed": true/false, "confidenceScore": 0-100, "feedback": "detailed 2-3 sentence professional assessment", "criticalFailReason": "only include if failed"}

SCORING CRITERIA:
- 85-100: Excellent → Verify immediately
- 70-84: Good → Verify with minor notes
- 50-69: Average → Requires re-interview
- Below 50: Failed → Reject
- Any CRITICAL_FAIL → Auto-reject regardless of other answers

Patient safety is paramount. You are strict and professional.`
