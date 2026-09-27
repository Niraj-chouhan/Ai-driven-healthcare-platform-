// ============================================================
// API ROUTE: /api/interview
// Purpose: Secure server-side Gemini AI interview for nurse vetting
// Model: gemini-3.1-flash-lite-preview
// Security: API key stays on server, never exposed to client
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { generateGeminiText } from "@/lib/gemini"

const INTERVIEW_SYSTEM_PROMPT = `You are Dr. Meera Krishnan, a Senior Medical Recruiter and Clinical Quality Assessor for a verified home healthcare platform in India.

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

export async function POST(req: NextRequest) {
  try {
    const { messages, action, language } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Append EVALUATE_NOW if this is the final evaluation
    const apiMessages = action === "evaluate"
      ? [...messages, { role: "user", content: "EVALUATE_NOW" }]
      : messages
    const transcript = apiMessages
      .map((message) => `${message.role === "assistant" ? "AI assessor" : "Nurse"}: ${message.content}`)
      .join("\n\n")

    const text = await generateGeminiText({
      systemInstruction: language && language !== "en-IN"
        ? `${INTERVIEW_SYSTEM_PROMPT}\n\nLANGUAGE NOTE: The nurse has selected "${language}" as their preferred language. You may respond in that language for acknowledgments and feedback, but always keep clinical question text in simple, clear English or simple Hindi for accuracy. Never compromise clinical precision for language preference.`
        : INTERVIEW_SYSTEM_PROMPT,
      contents: [{
        role: "user",
        parts: [{ text: `Conversation transcript:\n\n${transcript}` }],
      }],
      maxOutputTokens: 1024,
      temperature: 0.4,
      responseMimeType: action === "evaluate" ? "application/json" : undefined,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Interview API error:", error)
    if (error instanceof Error && error.message === "AI service not configured") {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    if (error instanceof Error && error.message !== "Internal server error") {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
