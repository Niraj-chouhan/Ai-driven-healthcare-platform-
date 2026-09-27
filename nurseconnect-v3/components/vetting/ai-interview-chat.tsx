"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bot, Send, Mic, MicOff, Loader2, ShieldCheck,
  AlertTriangle, Globe2, FileAudio, Lock,
} from "lucide-react"
import type { IAIEvaluation } from "@/lib/vetting-types"
import { CLINICAL_QUESTIONS } from "@/lib/vetting-types"
import { saveVerifiedNurse } from "@/lib/firebase"
import { InterviewVoiceRecorder, INTERVIEW_LANGUAGES } from "@/components/vetting/interview-voice-recorder"
import type { VoiceRecording } from "@/components/vetting/interview-voice-recorder"
import { LanguageSelector } from "@/components/ui/language-selector"

interface Message {
  id: string
  role: "ai" | "nurse"
  text: string
  isQuestion?: boolean
  hasRecording?: boolean
}

interface NurseData {
  id: string
  name: string
  specialization: string
  email?: string
  [key: string]: any
}

interface AIInterviewChatProps {
  nurse: NurseData
  onVerified: (evaluation: IAIEvaluation) => void
}

async function logRecordingToServer(
  rec: VoiceRecording,
  nurse: NurseData,
  sessionId: string
): Promise<void> {
  try {
    await fetch("/api/interview-recording", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        nurseId: nurse.id,
        nurseName: nurse.name,
        questionIndex: rec.questionIndex,
        language: rec.language,
        durationMs: rec.durationMs,
        checksum: rec.checksum ?? "n/a",
      }),
    })
  } catch {
    // Non-blocking
  }
}

export function AIInterviewChat({ nurse, onVerified }: AIInterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: "intro",
    role: "ai",
    text: `Namaste ${nurse.name} 👋\n\nI'm **Dr. Meera Krishnan**, your clinical assessor today.\n\nI will ask you **5 clinical questions** to evaluate your competency as a **${nurse.specialization}** nurse. Patient safety depends on your accuracy.\n\nType "Ready" when you are prepared to begin.`,
  }])
  const [input, setInput] = useState("")
  const [questionIndex, setQuestionIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [done, setDone] = useState(false)
  const [apiHistory, setApiHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const [language, setLanguage] = useState("en-IN")
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])

  const sessionIdRef = useRef(`session-${nurse.id}-${Date.now()}`)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleTranscript = useCallback((text: string) => {
    setInput(text)
  }, [])

  const handleRecordingComplete = useCallback((rec: VoiceRecording) => {
    setRecordings(prev => {
      const filtered = prev.filter(r => r.questionIndex !== rec.questionIndex)
      return [...filtered, rec]
    })
    logRecordingToServer(rec, nurse, sessionIdRef.current)
  }, [nurse])

  function addMsg(msg: Omit<Message, "id">) {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString() + Math.random() }])
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading || done) return
    const hasRec = recordings.some(r => r.questionIndex === questionIndex)
    addMsg({ role: "nurse", text, hasRecording: hasRec })
    setInput("")
    setLoading(true)

    if (questionIndex === -1) {
      const openingMsg = `Namaste ${nurse.name}. I'm **Dr. Meera Krishnan**, your clinical assessor today.\n\nI will ask you **5 clinical questions** to evaluate your competency as a **${nurse.specialization}** nurse. Please answer each question thoroughly — patient safety depends on accuracy.\n\n---\n\n**Question 1 of 5:**\n\n${CLINICAL_QUESTIONS[0]}`
      setApiHistory([{ role: "assistant" as const, content: openingMsg }])
      setQuestionIndex(0)
      addMsg({ role: "ai", text: openingMsg, isQuestion: true })
      setLoading(false)
      return
    }

    const isLastQuestion = questionIndex === CLINICAL_QUESTIONS.length - 1
    const newHistory = [...apiHistory, { role: "user" as const, content: text }]

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, action: isLastQuestion ? "evaluate" : undefined, language }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      const aiText: string = data.text ?? ""

      if (aiText.startsWith("CRITICAL_FAIL:")) {
        const reason = aiText.replace("CRITICAL_FAIL:", "").trim()
        addMsg({
          role: "ai",
          text: `⚠️ **Critical Error Detected**\n\n${reason}\n\nYour answer contains clinically dangerous information. The interview has been terminated.`,
        })
        setDone(true)
        setLoading(false)
        return
      }

      if (isLastQuestion) {
        try {
          const jsonMatch = aiText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const evaluation = JSON.parse(jsonMatch[0])
            const didPass = evaluation.passed === true
            const confScore = Math.min(100, Math.max(0, evaluation.confidenceScore ?? 0))
            const recCount = recordings.length

            setPassed(didPass)
            setScore(confScore)

            addMsg({
              role: "ai",
              text: didPass
                ? `✅ **Interview Complete — PASSED**\n\nScore: **${confScore}/100**\n\n${evaluation.feedback}\n\n${recCount > 0 ? `🎙️ ${recCount} voice recording(s) securely saved.\n\n` : ""}Your profile is now **VERIFIED** and will appear in the live job feed.`
                : `❌ **Interview Complete — NOT QUALIFIED**\n\nScore: **${confScore}/100**\n\n${evaluation.feedback}\n\nYou may re-apply after completing additional training.`,
            })

            if (didPass) {
              await saveVerifiedNurse({
                ...nurse,
                isVerified: true,
                interviewScore: confScore,
                interviewStatus: "Qualified",
                voiceRecordingCount: recordings.length,
                interviewLanguage: language,
                interviewSessionId: sessionIdRef.current,
              }).catch(console.error)

              setTimeout(() => {
                onVerified({
                  passed: true,
                  confidenceScore: confScore,
                  feedback: evaluation.feedback,
                  evaluatedAt: new Date(),
                })
              }, 2000)
            }
            setDone(true)
          }
        } catch {
          addMsg({ role: "ai", text: aiText })
        }
        setLoading(false)
        return
      }

      const nextIndex = questionIndex + 1
      const nextText = `${aiText}\n\n---\n\n**Question ${nextIndex + 1} of 5:**\n\n${CLINICAL_QUESTIONS[nextIndex]}`
      const updatedHistory = [...newHistory, { role: "assistant" as const, content: nextText }]
      setApiHistory(updatedHistory)
      setQuestionIndex(nextIndex)
      addMsg({ role: "ai", text: nextText, isQuestion: true })
    } catch {
      addMsg({ role: "ai", text: "⚠️ Connection error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  function toggleListening() {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const r = new SR()
    recognitionRef.current = r
    r.lang = language
    r.onresult = (e: SpeechRecognitionEvent) => { setInput(e.results[0][0].transcript); setIsListening(false) }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    r.start()
    setIsListening(true)
  }

  const progress = questionIndex < 0 ? 0 : (questionIndex / CLINICAL_QUESTIONS.length) * 100
  const selectedLang = INTERVIEW_LANGUAGES.find(l => l.code === language)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Dr. Meera Krishnan — AI Clinical Assessor</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-muted-foreground">Powered by Gemini AI • 5 questions</p>
                <Badge variant="secondary" className="text-[9px] h-4 bg-purple-100 text-purple-700">Real AI</Badge>
                {recordings.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] h-4 bg-blue-100 text-blue-700 gap-0.5">
                    <FileAudio className="h-2.5 w-2.5" /> {recordings.length} recorded
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!done && <LanguageSelector value={language} onChange={setLanguage} compact />}
            {questionIndex >= 0 && !done && (
              <Badge variant="outline" className="text-xs">
                Q {Math.min(questionIndex + 1, CLINICAL_QUESTIONS.length)}/{CLINICAL_QUESTIONS.length}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3 text-emerald-500" />
          <span>Secure session</span>
          <span className="font-mono opacity-60">{sessionIdRef.current.slice(-12)}</span>
          {selectedLang && (
            <><span className="opacity-40">•</span><Globe2 className="h-3 w-3" /><span>{selectedLang.flag} {selectedLang.label}</span></>
          )}
        </div>

        {questionIndex >= 0 && <Progress value={progress} className="h-1.5" />}

        {done && score !== null && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            passed ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {passed
              ? <><ShieldCheck className="h-4 w-4 shrink-0" /><span><strong>Verified!</strong> Score: {score}/100{recordings.length > 0 ? ` • ${recordings.length} recording(s) archived` : ""}</span></>
              : <><AlertTriangle className="h-4 w-4 shrink-0" /><span><strong>Not Qualified.</strong> Score: {score}/100</span></>
            }
          </div>
        )}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="h-[380px] overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "nurse" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "ai" ? "bg-primary/10" : "bg-sky-100"
                }`}>
                  {msg.role === "ai"
                    ? <Bot className="h-4 w-4 text-primary" />
                    : <span className="text-xs font-bold text-sky-700">{nurse.name[0]}</span>
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-muted text-foreground rounded-tl-sm"
                    : "bg-primary text-white rounded-tr-sm"
                }`}>
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-1" : ""}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                  ))}
                  {msg.hasRecording && (
                    <div className="mt-1.5 flex items-center gap-1 opacity-70">
                      <FileAudio className="h-3 w-3" /><span className="text-[10px]">Voice recorded</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Dr. Meera is evaluating...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Voice recorder panel — shown for active interview questions */}
          {!done && questionIndex >= 0 && (
            <div className="px-3 py-2.5 border-t bg-muted/20">
              <InterviewVoiceRecorder
                questionIndex={questionIndex}
                onRecordingComplete={handleRecordingComplete}
                onTranscript={handleTranscript}
                language={language}
                disabled={loading}
              />
            </div>
          )}

          {!done && (
            <div className="p-3 flex gap-2 border-t">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleListening}
                className={isListening ? "border-red-400 bg-red-50 text-red-500" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder={questionIndex < 0 ? "Type 'Ready' to begin..." : "Type your answer or use voice above..."}
                disabled={loading}
                className="flex-1"
              />
              <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recording audit list */}
      {recordings.length > 0 && (
        <div className="rounded-lg border bg-card p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileAudio className="h-3.5 w-3.5" />Voice Recordings — Secure Audit Log
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {recordings.map(rec => (
              <div key={rec.id} className="flex items-center gap-1.5 text-[11px] bg-muted rounded px-2 py-1">
                <span className="text-emerald-500">●</span>
                <span>Q{rec.questionIndex + 1}</span>
                <span className="opacity-60">{(rec.durationMs / 1000).toFixed(1)}s</span>
                <span className="font-mono opacity-50 truncate">{rec.checksum?.slice(0, 6)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isListening && (
        <p className="text-xs text-red-500 animate-pulse flex items-center gap-1">
          <Mic className="h-3 w-3" /> Listening... speak your answer clearly
        </p>
      )}
    </div>
  )
}
