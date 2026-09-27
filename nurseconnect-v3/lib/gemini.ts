const GEMINI_MODEL = "gemini-3.1-flash-lite-preview"

type GeminiContent = {
  role: "user" | "model"
  parts: Array<{ text: string }>
}

type GenerateGeminiTextOptions = {
  contents: GeminiContent[]
  systemInstruction?: string
  maxOutputTokens?: number
  temperature?: number
  responseMimeType?: "application/json" | "text/plain"
}

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
}

export async function generateGeminiText({
  contents,
  systemInstruction,
  maxOutputTokens = 700,
  temperature = 0.5,
  responseMimeType,
}: GenerateGeminiTextOptions) {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    throw new Error("AI service not configured")
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(systemInstruction
          ? {
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            }
          : {}),
        contents,
        generationConfig: {
          temperature,
          topP: 0.9,
          maxOutputTokens,
          ...(responseMimeType ? { responseMimeType } : {}),
        },
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = "AI service error"
    try {
      const parsed = JSON.parse(errorText)
      errorMessage = parsed?.error?.message ?? errorMessage
    } catch {
      // Keep the generic message if Gemini returns non-JSON error text.
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim() ?? ""
  )
}
