// ============================================================
// API ROUTE: /api/interview-recording
// Purpose: Securely log interview voice recording metadata
//          for compliance, audit, and tamper detection.
// Security: Only metadata stored server-side (blob stays client)
//           API key never exposed to client
// ============================================================

import { NextRequest, NextResponse } from "next/server"

export interface RecordingMetadata {
  sessionId: string
  nurseId: string
  nurseName: string
  questionIndex: number
  language: string
  durationMs: number
  checksum: string
  createdAt: string
}

// In production this would persist to Firestore/DB
// Here we log + return a confirmation token
const recordingLog: RecordingMetadata[] = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<RecordingMetadata>

    // Validate required fields
    const required: (keyof RecordingMetadata)[] = [
      "sessionId", "nurseId", "questionIndex", "language", "durationMs", "checksum"
    ]
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
      }
    }

    const entry: RecordingMetadata = {
      sessionId: body.sessionId!,
      nurseId: body.nurseId!,
      nurseName: body.nurseName ?? "Unknown",
      questionIndex: Number(body.questionIndex),
      language: body.language!,
      durationMs: Number(body.durationMs),
      checksum: body.checksum!,
      createdAt: new Date().toISOString(),
    }

    recordingLog.push(entry)

    // Generate a confirmation token = checksum + timestamp hash
    const token = `rc-${entry.checksum}-${Date.now().toString(36)}`

    console.info(
      `[RecordingLog] Nurse="${entry.nurseName}" Q${entry.questionIndex + 1} ` +
      `Lang=${entry.language} Duration=${(entry.durationMs / 1000).toFixed(1)}s ` +
      `Checksum=${entry.checksum}`
    )

    return NextResponse.json({
      success: true,
      token,
      message: "Recording metadata logged for compliance",
    })
  } catch (err) {
    console.error("Recording log error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Admin endpoint — in prod, protect with auth middleware
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  const nurseId = searchParams.get("nurseId")

  let results = [...recordingLog]
  if (sessionId) results = results.filter(r => r.sessionId === sessionId)
  if (nurseId) results = results.filter(r => r.nurseId === nurseId)

  return NextResponse.json({ recordings: results, total: results.length })
}
