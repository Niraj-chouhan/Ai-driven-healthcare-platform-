// ============================================================
// API ROUTE: /api/summarize
// Purpose: AI-generated patient summary for nurse dashboard
// Model: gemini-3.1-flash-lite-preview
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { generateGeminiText } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { patientName, age, problem, vitals, medicalHistory } = await req.json()

    const prompt = `You are a clinical AI assistant for a home healthcare platform.

Generate a concise nursing briefing for the following patient:

Patient: ${patientName}, Age: ${age}
Chief Complaint: ${problem}
${vitals ? `Vitals: ${JSON.stringify(vitals)}` : ""}
${medicalHistory ? `Medical History: ${medicalHistory}` : ""}

Respond ONLY with JSON:
{
  "summary": "2-3 sentence clinical summary for the nurse",
  "keyAlerts": ["alert1", "alert2"],
  "suggestedActions": ["action1", "action2", "action3"],
  "riskLevel": "low" | "medium" | "high",
  "estimatedVisitDuration": "30 mins" | "45 mins" | "60 mins"
}`

    const rawText = await generateGeminiText({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      maxOutputTokens: 512,
      temperature: 0.3,
      responseMimeType: "application/json",
    })

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]))
      }
    } catch { /* fallback */ }

    return NextResponse.json({
      summary: rawText.substring(0, 200),
      keyAlerts: [],
      suggestedActions: ["Assess vitals", "Review medications", "Document findings"],
      riskLevel: "medium",
      estimatedVisitDuration: "45 mins",
    })
  } catch (error) {
    console.error("Summarize API error:", error)
    if (error instanceof Error && error.message === "AI service not configured") {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    if (error instanceof Error && error.message !== "Internal server error") {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
