// ============================================================
// API ROUTE: /api/nurse-match
// Purpose: AI-powered nurse-to-patient matching
// Model: gemini-3.1-flash-lite-preview
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { generateGeminiText } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { patientProblem, patientAge, availableNurses } = await req.json()

    const prompt = `You are an AI nurse-matching system for a home healthcare platform in India.

Patient Request:
- Problem: ${patientProblem}
- Age: ${patientAge}

Available Nurses:
${JSON.stringify(availableNurses, null, 2)}

Analyze the patient's needs and rank the nurses by best fit.
Respond ONLY with JSON:
{
  "rankedNurseIds": ["id1", "id2", "id3"],
  "matchReason": "Brief explanation of top match",
  "urgencyLevel": "low" | "medium" | "high",
  "recommendedSpecialization": "General Care" | "ICU" | "Pediatrics" | "Elder Care" | "Emergency"
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

    // Default: return nurses in original order
    return NextResponse.json({
      rankedNurseIds: availableNurses.map((n: { id: string }) => n.id),
      matchReason: "Matching based on availability",
      urgencyLevel: "medium",
      recommendedSpecialization: "General Care",
    })
  } catch (error) {
    console.error("Nurse match API error:", error)
    if (error instanceof Error && error.message === "AI service not configured") {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    if (error instanceof Error && error.message !== "Internal server error") {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
