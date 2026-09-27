"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Stethoscope, MapPin, Star, Clock, Phone, CheckCircle2,
  XCircle, LogOut, Bell, BellOff, Video, Mic, MicOff,
  Camera, X, Bot, AlertCircle, Calendar, Wifi, WifiOff
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { useRouter } from "next/navigation"
import { InterviewVoiceRecorder, INTERVIEW_LANGUAGES } from "@/components/vetting/interview-voice-recorder"
import type { VoiceRecording } from "@/components/vetting/interview-voice-recorder"
import { LanguageSelector } from "@/components/ui/language-selector"

// ─── AI Interview Modal ──────────────────────────────────────
const INTERVIEW_QUESTIONS = [
  { q: "Hello! I am your AI interviewer. First question: If a patient’s BP drops to 80/50, what steps would you take?", topic: "Emergency Response" },
  { q: "Great. Next question: A diabetic patient develops hypoglycemia — what are the signs and how would you respond?", topic: "Diabetic Care" },
  { q: "Excellent. Describe the infection signs in a post-operative wound and how you would manage them.", topic: "Wound Management" },
  { q: "Final question: An elderly patient is experiencing anaphylaxis — what is your immediate step-by-step response?", topic: "Critical Care" },
]

// ─── Audio Waveform visualiser (CSS-only bars) ────────────────
function AudioWave({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[2,4,6,3,5,7,4,6,3,5,4,2,5,3,6].map((h, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full transition-all ${playing ? "bg-sky-400" : "bg-white/20"}`}
          style={{
            height: playing ? `${h * 2 + 2}px` : "3px",
            animation: playing ? `pulse ${0.3 + (i % 5) * 0.1}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Single recording player card ────────────────────────────
function RecordingPlayer({
  question, answer, recording, index,
}: {
  question: { q: string; topic: string }
  answer: string
  recording?: VoiceRecording
  index: number
}) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number>(0)

  function togglePlay() {
    if (!recording) return
    if (!audioRef.current) {
      audioRef.current = new Audio(recording.url)
      audioRef.current.onended = () => { setPlaying(false); setProgress(0) }
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
      cancelAnimationFrame(rafRef.current)
    } else {
      audioRef.current.play()
      setPlaying(true)
      const tick = () => {
        if (!audioRef.current) return
        const pct = audioRef.current.duration
          ? (audioRef.current.currentTime / audioRef.current.duration) * 100
          : 0
        setProgress(pct)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !recording) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * audioRef.current.duration
    setProgress(pct * 100)
  }

  function handleDownload() {
    if (!recording) return
    const a = document.createElement("a")
    a.href = recording.url
    a.download = `interview-q${index + 1}-${recording.topic || question.topic}.webm`
    a.click()
  }

  const durSec = recording ? Math.floor(recording.durationMs / 1000) : 0
  const durFmt = `${Math.floor(durSec / 60)}:${String(durSec % 60).padStart(2, "0")}`
  const wordCount = answer?.trim().split(/\s+/).filter(Boolean).length ?? 0

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="h-8 w-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
          <span className="text-sky-400 text-xs font-bold">Q{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-sky-400 uppercase tracking-wide">{question.topic}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{question.q.slice(0, 70)}…</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {recording && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">
              🎙️ {durFmt}
            </span>
          )}
          <span className="text-[10px] bg-white/5 text-slate-400 border border-white/10 rounded-full px-2 py-0.5">
            {wordCount} words
          </span>
        </div>
      </div>

      {/* Audio player */}
      {recording ? (
        <div className="px-4 py-3 space-y-3">
          {/* Waveform + controls row */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                playing
                  ? "bg-sky-500 shadow-lg shadow-sky-500/30"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {playing
                ? <span className="flex gap-0.5"><span className="w-0.5 h-3.5 bg-white rounded-full" /><span className="w-0.5 h-3.5 bg-white rounded-full" /></span>
                : <span className="ml-0.5 border-l-10 border-l-white border-y-6 border-y-transparent" />
              }
            </button>
            <div className="flex-1 space-y-1.5">
              <AudioWave playing={playing} />
              {/* Seek bar */}
              <div
                className="h-1 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
                onClick={seekTo}
              >
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors shrink-0"
              title="Download recording"
            >
              <span className="text-slate-400 text-xs">↓</span>
            </button>
          </div>

          {/* Transcript if available */}
          {answer?.trim() && (
            <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1 font-semibold">Transcript / Written Answer</p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{answer}</p>
            </div>
          )}
        </div>
      ) : (
        /* No recording — only written answer */
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <span className="text-xs">⚠️</span>
            <p className="text-xs text-amber-400">No voice recording found — only written answer available</p>
          </div>
          {answer?.trim() && (
            <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
              <p className="text-xs text-slate-300 leading-relaxed">{answer}</p>
            </div>
          )}
          {!answer?.trim() && (
            <p className="text-xs text-slate-500 italic">No answer was recorded.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Done screen with full playback ──────────────────────────
function InterviewDoneScreen({
  questions, answers, recordings, onClose,
}: {
  questions: { q: string; topic: string }[]
  answers: string[]
  recordings: VoiceRecording[]
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<"recordings" | "summary">("recordings")
  const totalRecordings = recordings.length
  const totalWords = answers.reduce((acc, a) => acc + (a?.trim().split(/\s+/).filter(Boolean).length ?? 0), 0)

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#12131a] border-b border-white/10 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Interview Complete 🎉</p>
            <p className="text-slate-400 text-xs">You can review your recordings here</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-1">
              {totalRecordings}/{questions.length} recorded
            </span>
            <span className="text-[10px] bg-white/5 text-slate-400 border border-white/10 rounded-full px-2.5 py-1">
              ~{totalWords} words total
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { id: "recordings", label: "🎙️ Recordings & Answers" },
            { id: "summary", label: "📋 Summary" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === "recordings" && (
          <>
            <p className="text-xs text-slate-500 mb-1">Press play to hear your answer. You can also download it.</p>
            {questions.map((q, i) => (
              <RecordingPlayer
                key={i}
                index={i}
                question={q}
                answer={answers[i] ?? ""}
                recording={recordings.find(r => r.questionIndex === i)}
              />
            ))}
          </>
        )}

        {activeTab === "summary" && (
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Interview Stats</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">{questions.length}</p>
                  <p className="text-[10px] text-slate-500">Questions</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xl font-bold text-emerald-400">{totalRecordings}</p>
                  <p className="text-[10px] text-slate-500">Recordings</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xl font-bold text-sky-400">{totalWords}</p>
                  <p className="text-[10px] text-slate-500">Total Words</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-400 mb-1">⚠️ Important Note</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recordings are available only for this session. They will be deleted when the browser closes. Download now if you need a backup.
              </p>
            </div>

            <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-sky-400 mb-1">🤖 AI Evaluation</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your written answers have been sent to AI for analysis. You’ll receive the result on the nurse dashboard within <span className="text-sky-300 font-semibold">24 hours</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#12131a] border-t border-white/10 p-4 shrink-0">
        <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

// Typing animation component
function TypingText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
        onDone?.()
      }
    }, 22)
    return () => clearInterval(interval)
  }, [text])
  return <span>{displayed}{!done && <span className="inline-block w-0.5 h-4 bg-white/80 ml-0.5 animate-pulse align-middle" />}</span>
}

function AIInterviewModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<"instructions" | "interview" | "done">("instructions")
  const [questionIdx, setQuestionIdx] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [answer, setAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [timer, setTimer] = useState(300)
  const [cameraError, setCameraError] = useState("")
  const [language, setLanguage] = useState("hi-IN")
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [questionTyped, setQuestionTyped] = useState(false)
  const [connectionTime, setConnectionTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const connTimerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (stage === "interview") {
      setQuestionTyped(false)
      setAiSpeaking(true)
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          streamRef.current = stream
          if (videoRef.current) videoRef.current.srcObject = stream
        })
        .catch(() => setCameraError("Camera access denied."))

      timerRef.current = setInterval(() => {
        setTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0 } return t - 1 })
      }, 1000)

      connTimerRef.current = setInterval(() => {
        setConnectionTime(c => c + 1)
      }, 1000)
    }
    return () => {
      clearInterval(timerRef.current!)
      clearInterval(connTimerRef.current!)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [stage])

  // Reset question state when question changes
  useEffect(() => {
    if (stage === "interview") {
      setQuestionTyped(false)
      setAiSpeaking(true)
    }
  }, [questionIdx])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
    setCharCount(answer.length)
  }, [answer])

  function toggleCamera() {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = camOff })
    }
    setCamOff(o => !o)
  }

  function toggleMic() {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = micMuted })
    }
    setMicMuted(m => !m)
  }

  function toggleListening() {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const r = new SR()
    recognitionRef.current = r
    r.lang = language
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(res => res[0].transcript).join(" ")
      setAnswer(prev => prev ? prev + " " + transcript : transcript)
    }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    r.start()
    setIsListening(true)
  }

  function nextQuestion() {
    setAnswers(prev => [...prev, answer])
    setAnswer("")
    setTimer(300)
    if (questionIdx + 1 >= INTERVIEW_QUESTIONS.length) {
      setStage("done")
    } else {
      setQuestionIdx(q => q + 1)
    }
  }

  const mins = String(Math.floor(timer / 60)).padStart(2, "0")
  const secs = String(timer % 60).padStart(2, "0")
  const connMins = String(Math.floor(connectionTime / 60)).padStart(2, "0")
  const connSecs = String(connectionTime % 60).padStart(2, "0")
  const progress = ((questionIdx) / INTERVIEW_QUESTIONS.length) * 100

  // ── INSTRUCTIONS SCREEN ──
  if (stage === "instructions") {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-sky-600 to-blue-700 p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-base">SevaSetu AI Interview</p>
                <p className="text-xs text-sky-200">Long-term placement assessment</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs text-sky-100">
              <span className="bg-white/10 rounded-full px-2.5 py-1">4 Questions</span>
              <span className="bg-white/10 rounded-full px-2.5 py-1">~20 mins</span>
              <span className="bg-white/10 rounded-full px-2.5 py-1">AI Evaluated</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Checklist */}
            <div className="space-y-2">
              {[
                { icon: "📷", text: "Allow camera and microphone access" },
                { icon: "🔇", text: "Find a quiet room with no disturbances" },
                { icon: "⏱️", text: "You have 5 minutes for each question" },
                { icon: "🎙️", text: "Answer by voice or typing" },
                { icon: "🌐", text: "Ensure a stable internet connection" },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <p className="text-sm text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Language selector */}
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
              <span className="text-sm text-slate-300">Interview language</span>
              <LanguageSelector value={language} onChange={setLanguage} compact />
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1 border-white/20 text-slate-300 hover:bg-white/10 bg-transparent">
                Cancel
              </Button>
              <Button onClick={() => setStage("interview")} className="flex-1 bg-sky-600 hover:bg-sky-500 gap-2">
                <Video className="h-4 w-4" /> Join Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── DONE SCREEN ──
  if (stage === "done") {
    return (
      <InterviewDoneScreen
        questions={INTERVIEW_QUESTIONS}
        answers={answers}
        recordings={recordings}
        onClose={onClose}
      />
    )
  }

  // ── MAIN INTERVIEW SCREEN ──
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#12131a] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-semibold">LIVE</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-slate-400 text-xs font-mono">{connMins}:{connSecs}</span>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-slate-400 text-xs">SevaSetu AI Interview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-white/5 rounded-full px-2.5 py-1">
            Q {questionIdx + 1}/{INTERVIEW_QUESTIONS.length}
          </span>
          <div className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${timer < 60 ? "text-red-400 bg-red-500/10 border border-red-500/30" : "text-sky-400 bg-sky-500/10"}`}>
            {mins}:{secs}
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="h-0.5 bg-white/10 shrink-0">
        <div
          className="h-full bg-linear-to-r from-sky-500 to-blue-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── VIDEO AREA ── */}
      <div className="flex-1 relative overflow-hidden min-h-0">

        {/* AI avatar — full background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#0d1b2a] to-[#091018] flex items-center justify-center">
          {/* Animated AI orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            {aiSpeaking && (
              <>
                <div className="absolute h-48 w-48 rounded-full border border-sky-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute h-36 w-36 rounded-full border border-sky-500/30 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.3s" }} />
              </>
            )}
            {/* Core orb */}
            <div className={`h-28 w-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
              aiSpeaking
                ? "bg-linear-to-br from-sky-500 to-blue-600 shadow-sky-500/40"
                : "bg-linear-to-br from-slate-700 to-slate-800"
            }`}>
              <Bot className="h-14 w-14 text-white" />
            </div>
            {/* Speaking wave bars */}
            {aiSpeaking && (
              <div className="absolute -bottom-8 flex items-end gap-1 h-6">
                {[3, 5, 7, 4, 6, 3, 5].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-sky-400 rounded-full opacity-80"
                    style={{
                      height: `${h * 3}px`,
                      animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI name tag */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-white text-xs font-semibold">AI Interviewer</span>
            {aiSpeaking && <span className="text-sky-400 text-[10px] animate-pulse">● Speaking</span>}
          </div>
        </div>

        {/* Question card — positioned over AI */}
        <div className="absolute bottom-4 left-4 right-4">
          {/* Topic pill */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-2.5 py-0.5">
              {INTERVIEW_QUESTIONS[questionIdx].topic}
            </span>
          </div>
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <p className="text-white text-sm leading-relaxed min-h-12">
              <TypingText
                text={INTERVIEW_QUESTIONS[questionIdx].q}
                onDone={() => setAiSpeaking(false)}
              />
            </p>
          </div>
        </div>

        {/* Self preview — PiP style bottom right */}
        <div className="absolute bottom-4 right-4" style={{ zIndex: 10 }}>
          <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-xl relative">
            {camOff ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 gap-1">
                <Camera className="h-6 w-6 text-slate-500" />
                <span className="text-[9px] text-slate-500">Camera Off</span>
              </div>
            ) : cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-1">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-[9px] text-red-400 text-center px-1">No camera</span>
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            )}
            {/* You label */}
            <div className="absolute bottom-1 left-1 right-1 text-center">
              <span className="text-[9px] text-white/70 bg-black/50 rounded px-1">You</span>
            </div>
            {/* Mic indicator */}
            {isListening && (
              <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* ── ANSWER PANEL ── */}
      <div className="bg-[#12131a] border-t border-white/10 shrink-0">

        {/* Answer input header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Your Answer</span>
            {isListening && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Recording...
              </span>
            )}
          </div>
          <span className={`text-[10px] font-mono ${charCount > 400 ? "text-amber-400" : "text-slate-500"}`}>
            {charCount} chars
          </span>
        </div>

        {/* Voice recorder */}
        <div className="px-3 pb-2">
          <div className="bg-white/5 rounded-xl px-3 py-2">
            <InterviewVoiceRecorder
              questionIndex={questionIdx}
              onRecordingComplete={(rec) => setRecordings(prev => [...prev.filter(r => r.questionIndex !== rec.questionIndex), rec])}
              onTranscript={(text) => setAnswer(prev => prev ? prev + " " + text : text)}
              language={language}
            />
          </div>
        </div>

        {/* Textarea */}
        <div className="px-3 pb-2">
          <div className={`relative rounded-xl border transition-all ${
            isListening
              ? "border-red-500/50 bg-red-500/5 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
              : answer.length > 0
                ? "border-sky-500/50 bg-sky-500/5"
                : "border-white/10 bg-white/5"
          }`}>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={isListening ? "🎙️ You are speaking, I'm listening..." : "Type your answer here or record it with the microphone..."}
              className="w-full bg-transparent text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none min-h-18 max-h-36 overflow-y-auto"
              style={{ height: "auto" }}
            />
            {answer.length > 0 && (
              <button
                onClick={() => setAnswer("")}
                className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Controls row */}
        <div className="px-3 pb-3 flex items-center gap-2">
          {/* Mic toggle */}
          <button
            onClick={toggleMic}
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              micMuted
                ? "bg-red-500/20 border-red-500/40 text-red-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              camOff
                ? "bg-red-500/20 border-red-500/40 text-red-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            {camOff ? <Camera className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          </button>

          {/* Voice record button */}
          <button
            onClick={toggleListening}
            className={`h-10 px-4 rounded-xl flex items-center gap-2 border text-sm font-medium transition-all shrink-0 ${
              isListening
                ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            {isListening
              ? <><MicOff className="h-4 w-4" /> Stop</>
              : <><Mic className="h-4 w-4" /> Record</>
            }
          </button>

          {/* Submit button */}
          <Button
            className={`flex-1 h-10 gap-2 font-semibold text-sm transition-all ${
              answer.trim()
                ? "bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/20"
                : "bg-white/10 text-slate-500 cursor-not-allowed"
            }`}
            onClick={nextQuestion}
            disabled={!answer.trim()}
          >
            {questionIdx + 1 >= INTERVIEW_QUESTIONS.length
              ? <><CheckCircle2 className="h-4 w-4" /> Submit Interview</>
              : <>Next Question <span className="opacity-60">→</span></>
            }
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN NURSE PORTAL ───────────────────────────────────────
export default function NursePortalPage() {
  const {
    currentNurse, setNurseOnDuty, nurseRequests, updateRequest,
    userName, nurseProfile, setUserRole, addNotification,
    notificationPermission, requestPushPermission, isFirebaseConnected,
  } = useApp()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"requests" | "profile" | "earnings">("requests")
  const [showInterview, setShowInterview] = useState(false)

  const displayName = nurseProfile?.name || userName || currentNurse?.name || "Nurse"
  const isOnDuty = currentNurse?.isOnDuty ?? false

  // Real-time se sirf on-duty nurse ke liye requests
  const incomingRequests = nurseRequests.filter(r => r.status === "matched" || r.status === "pending")
  const acceptedRequests = nurseRequests.filter(r => r.status === "accepted" || r.status === "in-progress")

  // ── New request ke liye sound + notification ─────────────
  const prevCountRef = useRef(0)
  useEffect(() => {
    if (incomingRequests.length > prevCountRef.current && prevCountRef.current !== 0) {
      addNotification({
        type: "warning",
        title: "🔔 New Patient Request!",
        message: `${incomingRequests[0]?.patientName || "Patient"} has requested a nurse.`,
      })
    }
    prevCountRef.current = incomingRequests.length
  }, [incomingRequests.length])

  function handleLogout() { setUserRole(null); router.push("/") }

  async function handleAccept(reqId: string) {
    await updateRequest(reqId, { status: "accepted", acceptedNurseId: currentNurse?.id })
    addNotification({ type: "success", title: "✅ Request Accepted!", message: "The patient has been notified." })
  }

  async function handleDecline(reqId: string) {
    await updateRequest(reqId, { status: "cancelled" })
  }

  async function handleInterview(reqId: string) {
    await updateRequest(reqId, { status: "interview_sent" })
    setShowInterview(true)
  }

  async function handleMarkArrived(reqId: string) {
    await updateRequest(reqId, { status: "in-progress" })
    addNotification({ type: "success", title: "🚀 Arrived!", message: "The patient has been notified that you are on your way." })
  }

  return (
    <div className="min-h-screen bg-background">
      {showInterview && <AIInterviewModal onClose={() => setShowInterview(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">Nurse Portal</p>
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* App status */}
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isFirebaseConnected ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
              {isFirebaseConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span className="hidden sm:inline">{isFirebaseConnected ? "Live" : "Local"}</span>
            </div>
            {/* Notifications */}
            {notificationPermission !== "granted" ? (
              <Button variant="ghost" size="sm" onClick={requestPushPermission} className="gap-1 text-orange-600">
                <BellOff className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Bell className="h-4 w-4" />
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* On Duty Toggle */}
        <div className="border-t border-border bg-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <Label className="font-semibold text-sm">{isOnDuty ? "🟢 On Duty — Receiving Requests" : "🔴 Off Duty"}</Label>
          </div>
          <Switch checked={isOnDuty} onCheckedChange={setNurseOnDuty} />
        </div>

        {/* Tabs */}
        <div className="border-t border-border bg-white">
          <div className="container mx-auto px-4 flex">
            {([
              { id: "requests" as const, label: "Requests", count: incomingRequests.length },
              { id: "profile" as const, label: "Profile", count: 0 },
              { id: "earnings" as const, label: "Earnings", count: 0 },
            ]).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t.label}
                {t.count > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 h-4 min-w-4 animate-pulse">{t.count}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 pb-24 max-w-2xl space-y-4">

        {/* Push notification CTA */}
        {notificationPermission !== "granted" && (
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-orange-800 text-sm">⚠️ Background Alerts Off</p>
                <p className="text-xs text-orange-600">If the app is closed, patient request notifications will not be delivered.</p>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs shrink-0" onClick={requestPushPermission}>
                Enable
              </Button>
            </CardContent>
          </Card>
        )}

        {/* REQUESTS TAB */}
        {activeTab === "requests" && (
          <div className="space-y-5">
            {incomingRequests.length > 0 && (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-orange-600 animate-bounce" />
                </div>
                <div>
                  <p className="font-semibold text-orange-800 text-sm">🔔 {incomingRequests.length} New Request{incomingRequests.length > 1 ? "s" : ""} Arrived!</p>
                  <p className="text-xs text-orange-600">{isFirebaseConnected ? "Real-time data is live ✅" : "Local data"}</p>
                </div>
              </div>
            )}

            <div>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                Incoming Requests
                {incomingRequests.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse text-xs">{incomingRequests.length} new</Badge>
                )}
              </h2>

              {incomingRequests.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No requests right now.</p>
                    <p className="text-xs mt-1">Stay on duty to receive patient requests.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map(req => (
                    <Card key={req.id} className="border-2 border-orange-200 bg-orange-50/30 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{req.patientName}</p>
                            <p className="text-xs text-muted-foreground">{req.id}</p>
                          </div>
                          <Badge className={`text-xs shrink-0 ${req.mode === "temporary" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-sky-100 text-sky-700 border-sky-200"}`}>
                            {req.mode === "temporary" ? "⚡ Quick" : "📅 Long-term"}
                          </Badge>
                        </div>

                        <div className="bg-white rounded-lg p-3 text-sm border border-orange-100 space-y-2">
                          <p className="font-medium text-xs text-muted-foreground">Patient problem:</p>
                          <p className="text-sm">{req.problem}</p>
                        </div>

                        {req.aiSummary && (
                          <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                            <p className="text-xs font-semibold text-sky-700 mb-1 flex items-center gap-1">
                              <Bot className="h-3.5 w-3.5" /> AI Analysis:
                            </p>
                            <p className="text-xs text-sky-800 whitespace-pre-line">{req.aiSummary.split("\n").slice(0, 4).join("\n")}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.address}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{req.phone}</span>
                          {req.eta && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.eta} min away</span>}
                        </div>

                        <div className="flex gap-2">
                          {req.mode === "longterm" ? (
                            <Button className="flex-1 bg-sky-600 hover:bg-sky-700" size="sm" onClick={() => handleInterview(req.id)}>
                              <Video className="h-3.5 w-3.5 mr-1" /> Start Interview
                            </Button>
                          ) : (
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={() => handleAccept(req.id)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDecline(req.id)}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {acceptedRequests.length > 0 && (
              <div>
                <h2 className="font-bold text-base mb-2 text-muted-foreground">Accepted / In Progress</h2>
                <div className="space-y-2">
                  {acceptedRequests.map(req => (
                    <Card key={req.id} className="border shadow-sm bg-emerald-50/30">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{req.patientName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{req.address}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs bg-emerald-100 text-emerald-700">✅ Assigned</Badge>
                            <Button variant="outline" size="sm"><Phone className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                        {req.status === "accepted" && (
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs" onClick={() => handleMarkArrived(req.id)}>
                            🚀 Mark as Arrived — Notify Patient
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{displayName}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {currentNurse?.rating} rating
                  </p>
                  <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">✅ Verified Nurse</Badge>
                </div>
              </div>
              <div className="divide-y">
                {[
                  { label: "Email", value: nurseProfile?.email || currentNurse?.email || "Not provided" },
                  { label: "Phone", value: nurseProfile?.phone || currentNurse?.phone || "Not provided" },
                  { label: "Experience", value: nurseProfile?.experience || currentNurse?.experience || "Not provided" },
                  { label: "Location", value: nurseProfile?.city || currentNurse?.address || "Not provided" },
                  { label: "Specializations", value: (nurseProfile?.specializations || currentNurse?.specializations || []).join(", ") || "Not provided" },
                  { label: "Push Notifications", value: notificationPermission === "granted" ? "✅ Active" : "❌ Disabled" },
                  { label: "App Status", value: isFirebaseConnected ? "🟢 Connected (Real-time)" : "🟠 Local Mode" },
                ].map(item => (
                  <div key={item.label} className="py-2.5 flex justify-between items-start gap-3">
                    <p className="text-sm text-muted-foreground min-w-32.5">{item.label}</p>
                    <p className="text-sm font-medium text-right">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-emerald-600">{currentNurse?.visitsToday ?? 3}</p>
                  <p className="text-xs text-muted-foreground">Today's Visits</p>
                </div>
                <div className="bg-sky-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-sky-600">₹{currentNurse?.earnings ?? 800}</p>
                  <p className="text-xs text-muted-foreground">Earned Today</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-amber-600">{currentNurse?.rating ?? 4.9}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "earnings" && (
          <div className="space-y-4">
            <Card className="border-2 border-emerald-200 bg-emerald-50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium mb-1">Today's Earnings</p>
                <p className="text-4xl font-extrabold text-emerald-700">₹{currentNurse?.earnings ?? 800}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentNurse?.visitsToday ?? 3} visits completed</p>
              </CardContent>
            </Card>
            {[
              { day: "Yesterday", amount: "₹1,200", visits: 5 },
              { day: "2 days ago", amount: "₹950", visits: 4 },
              { day: "3 days ago", amount: "₹1,400", visits: 6 },
            ].map(item => (
              <Card key={item.day} className="border shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.day}</p>
                    <p className="text-xs text-muted-foreground">{item.visits} visits</p>
                  </div>
                  <p className="font-bold text-emerald-600">{item.amount}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
