"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Send, Bot, User, Loader2, AlertTriangle, Phone } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { LanguageSelector } from "@/components/ui/language-selector"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  triageLevel?: "low" | "medium" | "high"
  requiresNurse?: boolean
  requiresEmergency?: boolean
  timestamp: Date
}

const quickSymptoms = [
  { label: "Fever", icon: "🤒" },
  { label: "Chest pain", icon: "💔" },
  { label: "Headache", icon: "🤕" },
  { label: "Stomach ache", icon: "🤢" },
  { label: "Shortness of breath", icon: "😮‍💨" },
  { label: "Weakness", icon: "😴" },
]

export function ChatbotInterface() {
  const { addMessage, setTriageLevel } = useApp() as any
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: "1",
    role: "assistant",
    content: "Hello! 💙 I’m your AI health assistant.\n\nTell me your symptoms — in English, Hindi, or Hinglish. I will assess them and connect you to a nurse if needed.\n\n(You can also choose from the quick symptoms below)",
    timestamp: new Date(),
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [apiHistory, setApiHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [language, setLanguage] = useState("hi-IN")
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    setInput("")

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setChatMessages(prev => [...prev, userMsg])

    const newHistory = [...apiHistory, { role: "user" as const, content: text }]
    setApiHistory(newHistory)
    setLoading(true)

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, language }),
      })

      if (!res.ok) throw new Error("API error")
      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Sorry, I couldn't understand that. Please try again.",
        triageLevel: data.triageLevel,
        requiresNurse: data.requiresNurse,
        requiresEmergency: data.requiresEmergency,
        timestamp: new Date(),
      }

      setChatMessages(prev => [...prev, assistantMsg])
      setApiHistory(prev => [...prev, { role: "assistant", content: data.message }])

      if (data.triageLevel && setTriageLevel) {
        setTriageLevel(data.triageLevel)
      }
      if (addMessage) {
        addMessage(text, "user")
        addMessage(data.message, "assistant")
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, the service is currently unavailable. Please try again shortly or book a nurse directly.",
        timestamp: new Date(),
      }
      setChatMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  function toggleListening() {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const r = new SR()
    recognitionRef.current = r
    r.lang = language
    r.continuous = false
    r.interimResults = false
    r.onresult = (e: SpeechRecognitionEvent) => {
      setInput(e.results[0][0].transcript)
      setIsListening(false)
    }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    r.start()
    setIsListening(true)
  }

  function getTriageBadge(level?: "low" | "medium" | "high") {
    if (!level) return null
    const config = {
      low: { label: "Low Risk", className: "bg-emerald-100 text-emerald-700" },
      medium: { label: "Medium Risk", className: "bg-amber-100 text-amber-700" },
      high: { label: "High Risk", className: "bg-red-100 text-red-700" },
    }
    const c = config[level]
    return <Badge className={`text-[10px] ${c.className}`}>{c.label}</Badge>
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Language selector + quick symptoms */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {quickSymptoms.map((s) => (
          <button
            key={s.label}
            onClick={() => sendMessage(s.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-medium transition-colors border border-sky-100"
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
        </div>
        <LanguageSelector value={language} onChange={setLanguage} compact />
      </div>

      {/* Chat area */}
      <Card className="flex-1 shadow-sm">
        <CardContent className="p-0 flex flex-col h-90">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant" ? "bg-primary/10" : "bg-sky-100"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="h-4 w-4 text-primary" />
                    : <User className="h-4 w-4 text-sky-600" />
                  }
                </div>
                <div className={`max-w-[80%] space-y-1.5`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-muted text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
                    ))}
                  </div>
                  {msg.role === "assistant" && (msg.triageLevel || msg.requiresEmergency) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTriageBadge(msg.triageLevel)}
                      {msg.requiresEmergency && (
                        <button className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-medium animate-pulse">
                          <Phone className="h-2.5 w-2.5" /> Call 112
                        </button>
                      )}
                      {msg.requiresNurse && !msg.requiresEmergency && (
                        <Badge className="text-[10px] bg-blue-100 text-blue-700">Nurse Recommended</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Analyzing symptoms...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleListening}
              className={`shrink-0 ${isListening ? "border-red-400 bg-red-50 text-red-500" : ""}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Describe your symptoms..."
              disabled={loading}
              className="flex-1"
            />
            <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim() || loading} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isListening && (
        <p className="text-xs text-red-500 animate-pulse flex items-center gap-1">
          <Mic className="h-3 w-3" /> Listening... speak in Hindi or English
        </p>
      )}
    </div>
  )
}
