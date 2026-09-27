// ============================================================
// AI INTERVIEW SERVICE — NurseConnect
// Now uses secure Next.js API route (/api/interview)
// API key stays on server — never exposed to client
// ============================================================

import type { IInterviewMessage, AIEvaluationResponse, InterviewFlowStatus } from "@/lib/vetting-types"
import { CLINICAL_QUESTIONS } from "@/lib/vetting-types"

// ─── Secure API wrapper (calls our own Next.js route) ────────

export async function callInterviewAPI(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  action?: "evaluate"
): Promise<string> {
  const response = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, action }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `API Error: ${response.status}`)
  }

  const data = await response.json()
  return data.text ?? ""
}

// ─── Parse AI evaluation ─────────────────────────────────────

export function parseAIEvaluation(rawText: string): AIEvaluationResponse {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON found in AI response")

  const parsed = JSON.parse(jsonMatch[0])
  if (typeof parsed.passed !== "boolean") throw new Error("Invalid 'passed' field")
  if (typeof parsed.confidenceScore !== "number") throw new Error("Invalid 'confidenceScore'")
  if (typeof parsed.feedback !== "string") throw new Error("Invalid 'feedback'")

  return {
    passed: parsed.passed,
    confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore)),
    feedback: parsed.feedback,
    criticalFailReason: parsed.criticalFailReason,
  }
}

// ─── Interview State ─────────────────────────────────────────

export interface InterviewState {
  status: InterviewFlowStatus
  messages: IInterviewMessage[]
  currentQuestionIndex: number
  nurseAnswers: string[]
  evaluation: AIEvaluationResponse | null
  criticalFailed: boolean
  criticalFailReason: string | null
  error: string | null
}

export const initialInterviewState: InterviewState = {
  status: "idle",
  messages: [],
  currentQuestionIndex: 0,
  nurseAnswers: [],
  evaluation: null,
  criticalFailed: false,
  criticalFailReason: null,
  error: null,
}

// ─── Build opening message ────────────────────────────────────

export function buildOpeningMessage(nurseName: string, specialization: string): IInterviewMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: `Namaste ${nurseName}. I'm **Dr. Meera Krishnan**, your clinical assessor today.\n\nI will ask you **5 clinical questions** to evaluate your competency as a **${specialization}** nurse. Please answer each question thoroughly — patient safety depends on accuracy.\n\n---\n\n**Question 1 of 5:**\n\n${CLINICAL_QUESTIONS[0]}`,
    timestamp: new Date(),
    questionNumber: 1,
  }
}

// ─── Process nurse answer ─────────────────────────────────────

export async function processNurseAnswer(
  state: InterviewState,
  nurseAnswer: string
): Promise<Partial<InterviewState>> {
  const { currentQuestionIndex, messages, nurseAnswers } = state

  const userMessage: IInterviewMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: nurseAnswer,
    timestamp: new Date(),
  }

  const updatedAnswers = [...nurseAnswers, nurseAnswer]
  const updatedMessages = [...messages, userMessage]
  const isLastQuestion = currentQuestionIndex === CLINICAL_QUESTIONS.length - 1

  const apiMessages = updatedMessages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))

  const aiResponse = await callInterviewAPI(
    apiMessages,
    isLastQuestion ? "evaluate" : undefined
  )

  // Critical failure check
  if (aiResponse.startsWith("CRITICAL_FAIL:")) {
    const failReason = aiResponse.replace("CRITICAL_FAIL:", "").trim()
    const failMessage: IInterviewMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `⚠️ **Critical Error Detected**\n\n${failReason}\n\nYour answer contains clinically dangerous information that could endanger patient safety. The interview has been terminated immediately.`,
      timestamp: new Date(),
    }
    return {
      status: "failed",
      messages: [...updatedMessages, failMessage],
      nurseAnswers: updatedAnswers,
      criticalFailed: true,
      criticalFailReason: failReason,
    }
  }

  // Final evaluation
  if (isLastQuestion) {
    const evaluation = parseAIEvaluation(aiResponse)
    const resultMessage: IInterviewMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: evaluation.passed
        ? `✅ **Interview Complete — PASSED**\n\nScore: **${evaluation.confidenceScore}/100**\n\n${evaluation.feedback}\n\nYour profile is now **VERIFIED** and will appear in the live job feed.`
        : `❌ **Interview Complete — NOT QUALIFIED**\n\nScore: **${evaluation.confidenceScore}/100**\n\n${evaluation.feedback}\n\nYou may re-apply after completing additional training.`,
      timestamp: new Date(),
    }
    return {
      status: evaluation.passed ? "completed" : "failed",
      messages: [...updatedMessages, resultMessage],
      nurseAnswers: updatedAnswers,
      currentQuestionIndex: currentQuestionIndex + 1,
      evaluation,
    }
  }

  // Next question
  const nextIndex = currentQuestionIndex + 1
  const nextMsg: IInterviewMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: `${aiResponse}\n\n---\n\n**Question ${nextIndex + 1} of 5:**\n\n${CLINICAL_QUESTIONS[nextIndex]}`,
    timestamp: new Date(),
    questionNumber: nextIndex + 1,
  }

  return {
    messages: [...updatedMessages, nextMsg],
    nurseAnswers: updatedAnswers,
    currentQuestionIndex: nextIndex,
    status: "questioning",
  }
}
