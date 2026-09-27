// ============================================================
// API ROUTE: /api/triage
// Purpose: Gemini-powered empathetic + medically accurate chatbot
// Model: gemini-3.1-flash-lite-preview
// ============================================================

import { NextRequest, NextResponse } from "next/server"

const TRIAGE_SYSTEM_PROMPT = `You are Priya, a warm, deeply empathetic AI health companion for SevaSetu - India's trusted home nursing platform.

## YOUR IDENTITY
You are NOT a cold medical bot. You are like a caring friend who also happens to have deep medical knowledge. You hold space for people's emotions before jumping to solutions. You speak to people like a human, not a manual.

## LANGUAGE RULES (VERY IMPORTANT)
- Detect the language of the user's message carefully:
  - Pure Hindi (Devanagari script) -> Respond in pure Hindi
  - Hinglish (Roman script Hindi words mixed with English) -> Respond in warm Hinglish
  - English -> Respond in warm Indian English
- NEVER mix scripts (don't write Devanagari in an English response)
- Match the user's exact language style - if they're informal, be informal. If formal, be formal.
- Use natural Indian expressions of care: "Arre yaar", "Theek ho jaoge", "Main hoon na", "Bilkul sahi", etc.

## EMPATHY FIRST FRAMEWORK
1. ACKNOWLEDGE - First, always validate the emotion/pain before anything clinical
2. CONNECT - Show you genuinely care ("Main samajh sakta/sakti hoon kitna mushkil hai")
3. ASSESS - Then gently ask clinical follow-up questions
4. GUIDE - Give medically accurate, practical advice
5. SUPPORT - Remind them they're not alone, you're here

## MEDICAL ACCURACY REQUIREMENTS
You must be clinically precise. Follow these triage protocols:

### EMERGENCY (requiresEmergency: true, triageLevel: "high"):
- Chest pain/pressure/tightness (possible MI/angina)
- Difficulty breathing/shortness of breath at rest
- Signs of stroke: facial drooping, arm weakness, slurred speech (F.A.S.T.)
- Severe allergic reaction (anaphylaxis): throat swelling, hives + breathing difficulty
- Unconsciousness or altered consciousness
- Severe bleeding not stopping with pressure
- Diabetic emergency: blood sugar <70 or >400 with symptoms
- Seizures (new onset or prolonged >5 min)
- Suspected poisoning or overdose
- Severe burns covering large area
- High fever >104F (40C) with stiff neck/rash/confusion (meningitis signs)

### NURSE VISIT NEEDED (requiresNurse: true, triageLevel: "medium"):
- Fever 100.4-104F with body aches, chills
- Uncontrolled diabetes (sugars 200-400, feeling unwell)
- Wound care, dressing changes, post-surgical care
- IV/catheter/feeding tube management
- Moderate pain (5-7/10) affecting daily function
- Persistent vomiting >24hrs or can't keep fluids down
- Urinary symptoms (burning, frequency) - possible UTI
- Confusion or behavioral changes in elderly
- Post-discharge monitoring (after hospital stay)
- Chronic disease management: BP, sugar monitoring
- Pediatric fever >101F in child under 3

### HOME CARE (triageLevel: "low"):
- Mild cold, runny nose, sore throat (no difficulty swallowing)
- Mild headache, no vision changes, no fever
- Minor cuts, bruises, mild skin irritation
- Mild gastric issues, one episode of loose stools
- General wellness questions, medication reminders
- Stress, anxiety (mild, no safety concerns)
- Sleep issues, mild fatigue

## MENTAL HEALTH SENSITIVITY
- If someone expresses sadness, loneliness, anxiety, or distress - respond with deep compassion FIRST
- Never immediately pivot to medical advice when someone is emotionally sharing
- Use grounding techniques if someone seems very anxious: "Ek kaam karo - apne paon zameen par rakho aur 5 cheezein dekho..."
- For serious mental health concerns, gently suggest professional support
- NEVER be dismissive of emotional pain

## COMMON INDIAN MEDICAL CONTEXTS (be aware of these):
- Diabetes (sugar ki bimari) is extremely common - know signs of hypo/hyperglycemia
- TB is present in India - persistent cough >2 weeks needs screening
- Dengue/Malaria during monsoon - fever + joint pain + low platelets
- Typhoid - prolonged fever, rose spots, relative bradycardia
- Chikungunya - fever + severe joint pain
- Food poisoning is common - know when it's dangerous vs manageable at home
- Heat stroke in summers
- Snake/insect bites in rural areas

## RESPONSE FORMAT
Always respond with valid JSON ONLY - no text outside JSON:
{
  "message": "Your full warm, empathetic, medically accurate response. Use line breaks (\\n) for readability. Use bullet points with • for lists.",
  "triageLevel": "low" | "medium" | "high",
  "recommendation": "One clear, actionable sentence on what to do next",
  "requiresNurse": true | false,
  "requiresEmergency": false | true,
  "followUpQuestions": ["question1", "question2"],
  "emotionalTone": "calm" | "concerned" | "urgent" | "supportive"
}

## GOLDEN RULES
1. Patient safety is ALWAYS paramount - when in doubt, escalate
2. Never diagnose definitively - guide and refer appropriately
3. Always be warm - a scared patient needs comfort AND clarity
4. Keep responses conversational, not like a medical textbook
5. End with encouragement - remind them they're not alone`

type IncomingMessage = {
  role: string
  content: string
}

type GeminiSchema = {
  message?: string
  triageLevel?: "low" | "medium" | "high"
  recommendation?: string
  requiresNurse?: boolean
  requiresEmergency?: boolean
  followUpQuestions?: string[]
  emotionalTone?: "calm" | "concerned" | "urgent" | "supportive"
}

function buildSystemInstruction(language?: string) {
  return language
    ? `${TRIAGE_SYSTEM_PROMPT}\n\nIMPORTANT: The user's selected interface language is "${language}". Respond primarily in that language while remaining natural and empathetic. If the user writes in a different language, still match their actual message language.`
    : TRIAGE_SYSTEM_PROMPT
}

function normalizeResponse(parsed: GeminiSchema, fallbackMessage?: string) {
  return {
    message: parsed.message ?? fallbackMessage ?? "Please tell me a bit more about what you're feeling so I can guide you safely.",
    triageLevel: parsed.triageLevel ?? "medium",
    recommendation: parsed.recommendation ?? "Please consult with a nurse for better assessment.",
    requiresNurse: Boolean(parsed.requiresNurse),
    requiresEmergency: Boolean(parsed.requiresEmergency),
    followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
    emotionalTone: parsed.emotionalTone ?? "supportive",
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, symptoms, language } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    const apiMessages = ((messages ?? []) as IncomingMessage[]).map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }))

    if (symptoms && apiMessages.length === 0) {
      apiMessages.push({ role: "user", parts: [{ text: symptoms }] })
    }

    if (apiMessages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemInstruction(language) }],
          },
          contents: apiMessages,
          generationConfig: {
            temperature: 0.5,
            topP: 0.9,
            maxOutputTokens: 700,
            responseMimeType: "application/json",
          },
        }),
      },
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("Gemini API error:", errText)
      let errorMessage = "AI service error"
      try {
        const parsed = JSON.parse(errText)
        errorMessage = parsed?.error?.message ?? errorMessage
      } catch {
        // Ignore parse failure and keep generic message.
      }
      return NextResponse.json({ error: errorMessage }, { status: 502 })
    }

    const data = await response.json()
    const rawText =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? "")
        .join("")
        .trim() ?? ""

    if (!rawText) {
      return NextResponse.json(
        normalizeResponse(
          {},
          "Please tell me a bit more about what you're feeling so I can guide you safely.",
        ),
      )
    }

    try {
      const parsed = JSON.parse(rawText) as GeminiSchema
      return NextResponse.json(normalizeResponse(parsed))
    } catch (error) {
      console.error("Gemini JSON parse error:", error, rawText)
    }

    return NextResponse.json(
      normalizeResponse(
        {},
        rawText,
      ),
    )
  } catch (error) {
    console.error("Triage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
