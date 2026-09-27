"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Mic, MicOff, Send, User, Volume2, VolumeX,
  Heart, Loader2, Sparkles, AlertTriangle, Phone,
  CheckCircle, Stethoscope, ChevronRight
} from "lucide-react"
import { useApp } from "@/lib/app-context"

// ─── Types ────────────────────────────────────────────────────
type Lang = "hindi" | "hinglish" | "english"
type TriageLevel = "low" | "medium" | "high"

interface TriageResponse {
  message: string
  triageLevel: TriageLevel
  recommendation: string
  requiresNurse: boolean
  requiresEmergency: boolean
  followUpQuestions?: string[]
  emotionalTone?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  triage?: Pick<TriageResponse, "triageLevel" | "requiresNurse" | "requiresEmergency" | "recommendation" | "followUpQuestions">
  timestamp: Date
}

// ─── Language Detection ───────────────────────────────────────
function detectLanguage(text: string): Lang {
  if (/[\u0900-\u097F]/.test(text)) return "hindi"
  const hinglishWords = [
    "mujhe","hai","hain","mera","meri","kya","karo","chahiye","aur","nahi",
    "theek","bata","dard","bukhar","seena","saans","akela","darr","tension",
    "help","feel","pain","problem","ghabra","sar","pet","kal","aaj","bahut",
    "thoda","ho","raha","rahi","kar","mein","se","ke","ki","ka","hoon","main"
  ]
  const lower = text.toLowerCase()
  const count = hinglishWords.filter(w => lower.includes(w)).length
  return count >= 1 ? "hinglish" : "english"
}

// ─── Triage Badge ─────────────────────────────────────────────
function TriageBadge({ level, requiresEmergency, requiresNurse }: {
  level: TriageLevel
  requiresEmergency: boolean
  requiresNurse: boolean
}) {
  if (requiresEmergency) {
    return (
      <div className="flex items-center gap-1.5 mt-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs font-medium">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>Emergency — Call 112 immediately</span>
        <a href="tel:112" className="ml-auto flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full">
          <Phone className="h-3 w-3" /> 112
        </a>
      </div>
    )
  }
  if (requiresNurse) {
    return (
      <div className="flex items-center gap-1.5 mt-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2 text-xs font-medium">
        <Stethoscope className="h-3.5 w-3.5 shrink-0" />
        <span>Nurse visit recommended</span>
      </div>
    )
  }
  if (level === "low") {
    return (
      <div className="flex items-center gap-1.5 mt-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-xs font-medium">
        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
        <span>Manageable at home — Monitor symptoms</span>
      </div>
    )
  }
  return null
}

// ─── Quick Prompts ────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: "😣 Severe pain", msg: "I am experiencing a lot of pain" },
  { label: "🤒 Fever", msg: "I have a fever and body ache" },
  { label: "😰 Feeling anxious", msg: "I am very anxious and feeling tense" },
  { label: "🏠 Need a nurse", msg: "I need a nurse at home" },
  { label: "💔 Chest pain", msg: "I am having chest pain" },
  { label: "😔 Feeling sad", msg: "I'm feeling very sad and alone today" },
  { label: "🩸 Sugar concern", msg: "I have blood sugar issues and feel dizzy" },
  { label: "🤧 Cold symptoms", msg: "I have a cold and cough for several days" },
]

// ─── Welcome Message ──────────────────────────────────────────
const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hello! 🙏 I’m Priya, your AI health companion.\n\nYou can share anything — pain, stress, or health concerns. I support English, Hindi, and Hinglish.\n\nHow are you feeling today? 💙",
  timestamp: new Date(),
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

// ─── Main Component ───────────────────────────────────────────
export function EmpathyChat() {
  const { addMessage } = useApp()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [detectedLang, setDetectedLang] = useState<Lang | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, loading])

  const speakText = useCallback((text: string, lang: Lang) => {
    if (!ttsEnabled || typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const clean = text.replace(/[*#•🏠🌡️💙💗⚠️🌬️🏃📅⚡🙏😣🤒😰💔😔🤧🩸✅❌😊🎉]/g, "").trim()
    const utter = new SpeechSynthesisUtterance(clean)
    utter.lang = lang === "english" ? "en-IN" : "hi-IN"
    utter.rate = 0.88
    utter.pitch = 1.05
    window.speechSynthesis.speak(utter)
  }, [ttsEnabled])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setError(null)

    const lang = detectLanguage(text)
    setDetectedLang(lang)

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }

    setChatMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    addMessage(text.trim(), "user")

    try {
      // Build full conversation history for API
      const history = [...chatMessages.filter(m => m.id !== "welcome"), userMsg]
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, language: lang }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data: TriageResponse = await res.json()

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        triage: {
          triageLevel: data.triageLevel,
          requiresNurse: data.requiresNurse,
          requiresEmergency: data.requiresEmergency,
          recommendation: data.recommendation,
          followUpQuestions: data.followUpQuestions,
        },
        timestamp: new Date(),
      }

      setChatMessages(prev => [...prev, assistantMsg])
      addMessage(data.message, "assistant")
      speakText(data.message, lang)

    } catch (err) {
      console.error("Chat error:", err)
      const fallback =
        "Sorry, I'm having a connection issue. Please try again in a moment. If it's an emergency, call 112 immediately. 💙"

      setChatMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fallback,
        timestamp: new Date(),
      }])
      setError("Connection issue — check internet and try again.")
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function toggleListening() {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert("Voice input needs Chrome browser."); return }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "hi-IN"
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }

  function renderContent(content: string) {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("•")) {
        return (
          <p key={i} className={`flex gap-1.5 ${i > 0 ? "mt-1" : ""}`}>
            <span className="text-primary mt-0.5 shrink-0">•</span>
            <span>{line.slice(1).trim()}</span>
          </p>
        )
      }
      return <p key={i} className={i > 0 && line ? "mt-1.5" : i > 0 ? "mt-0.5" : ""}>{line}</p>
    })
  }

  const langLabel = detectedLang === "hindi" ? "Hindi" : detectedLang === "hinglish" ? "Hinglish" : detectedLang === "english" ? "English" : null

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Priya — AI Health Companion</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {langLabel ? `Speaking: ${langLabel}` : "Hindi • English • Hinglish"}
            </p>
          </div>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={() => setTtsEnabled(v => !v)}
          className={ttsEnabled ? "border-primary text-primary bg-primary/5" : ""}
        >
          {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="ml-1.5 text-xs">{ttsEnabled ? "Voice On" : "Voice"}</span>
        </Button>
      </div>

      {/* Chat */}
      <Card className="shadow-sm border overflow-hidden">
        <CardContent className="p-0">

          {/* Messages */}
          <div className="h-100 overflow-y-auto p-4 space-y-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "assistant" ? "bg-linear-to-br from-primary/20 to-primary/10" : "bg-sky-100"
                }`}>
                  {msg.role === "assistant"
                    ? <Sparkles className="h-4 w-4 text-primary" />
                    : <User className="h-4 w-4 text-sky-600" />
                  }
                </div>
                <div className={`max-w-[82%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-muted text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}>
                    {renderContent(msg.content)}
                  </div>

                  {msg.role === "assistant" && msg.triage && (
                    <TriageBadge
                      level={msg.triage.triageLevel}
                      requiresEmergency={msg.triage.requiresEmergency}
                      requiresNurse={msg.triage.requiresNurse}
                    />
                  )}

                  {msg.role === "assistant" && msg.triage?.followUpQuestions && msg.triage.followUpQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.triage.followUpQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary flex items-center gap-1 border border-primary/20"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                  <div className="flex gap-1 items-end">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-xs text-muted-foreground">Priya is thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.msg)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2 border-t bg-background">
            <Button
              variant="outline" size="icon"
              onClick={toggleListening}
              className={isListening ? "border-red-400 bg-red-50 text-red-500 animate-pulse" : ""}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Type in English, Hindi, or Hinglish..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listening bar */}
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-red-600 animate-pulse bg-red-50 rounded-xl px-4 py-2.5 border border-red-200">
          <Mic className="h-3.5 w-3.5" />
          <span>Listening... speak in Hindi or English</span>
          <div className="ml-auto flex gap-0.5 items-end">
            {[8, 12, 16, 12, 8].map((h, i) => (
              <div key={i} className="w-0.5 rounded-full bg-red-500 animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
