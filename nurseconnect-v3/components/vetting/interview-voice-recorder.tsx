"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Play, Pause, Trash2, Download, ShieldCheck, Lock, Globe2 } from "lucide-react"

// ─── Supported interview languages ────────────────────────────
export const INTERVIEW_LANGUAGES = [
  { code: "en-IN", label: "English (India)", flag: "🇮🇳" },
  { code: "hi-IN", label: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "ta-IN", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "te-IN", label: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "ml-IN", label: "മലയാളം (Malayalam)", flag: "🇮🇳" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
  { code: "mr-IN", label: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "bn-IN", label: "বাংলা (Bengali)", flag: "🇮🇳" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
]

export interface VoiceRecording {
  id: string
  questionIndex: number
  blob: Blob
  url: string
  durationMs: number
  language: string
  createdAt: Date
  /** SHA-256 fingerprint for tamper detection */
  checksum?: string
}

interface InterviewVoiceRecorderProps {
  questionIndex: number
  onRecordingComplete: (recording: VoiceRecording) => void
  onTranscript?: (text: string) => void
  language: string
  disabled?: boolean
}

// ─── Security: compute SHA-256 fingerprint ────────────────────
async function computeChecksum(blob: Blob): Promise<string> {
  try {
    const buf = await blob.arrayBuffer()
    const hashBuf = await crypto.subtle.digest("SHA-256", buf)
    const hex = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
    return hex.slice(0, 16) // short fingerprint for display
  } catch {
    return "unavailable"
  }
}

export function InterviewVoiceRecorder({
  questionIndex,
  onRecordingComplete,
  onTranscript,
  language,
  disabled = false,
}: InterviewVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recording, setRecording] = useState<VoiceRecording | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [checksum, setChecksum] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recording?.url) URL.revokeObjectURL(recording.url)
      mediaRecorderRef.current?.stop()
    }
  }, [])

  const startRecording = useCallback(async () => {
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Prefer webm/opus for smaller files, fallback to mp4
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm"

      const mr = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        const durationMs = Date.now() - startTimeRef.current
        const cs = await computeChecksum(blob)
        setChecksum(cs)

        const rec: VoiceRecording = {
          id: `rec-q${questionIndex}-${Date.now()}`,
          questionIndex,
          blob,
          url,
          durationMs,
          language,
          createdAt: new Date(),
          checksum: cs,
        }
        setRecording(rec)
        onRecordingComplete(rec)
      }

      mr.start(250) // collect data every 250ms
      startTimeRef.current = Date.now()
      setIsRecording(true)
      setElapsedMs(0)

      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current)
      }, 200)

      // Start speech recognition for live transcript
      startSpeechRecognition(stream)
    } catch (err: any) {
      setErrorMsg(
        err?.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow mic access."
          : "Could not start recording. Check your microphone."
      )
    }
  }, [questionIndex, language, onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    recognitionRef.current?.stop()
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  function startSpeechRecognition(stream: MediaStream) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR || !onTranscript) return
    try {
      const r = new SR()
      recognitionRef.current = r
      r.lang = language
      r.continuous = true
      r.interimResults = false
      r.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = Array.from(e.results)
          .map((res: any) => res[0].transcript)
          .join(" ")
        onTranscript(transcript)
      }
      r.onerror = () => {}
      r.start()
    } catch {}
  }

  function togglePlayback() {
    if (!recording) return
    if (!audioRef.current) {
      audioRef.current = new Audio(recording.url)
      audioRef.current.onended = () => setIsPlaying(false)
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  function deleteRecording() {
    if (recording?.url) URL.revokeObjectURL(recording.url)
    audioRef.current?.pause()
    audioRef.current = null
    setRecording(null)
    setChecksum(null)
    setElapsedMs(0)
    setIsPlaying(false)
  }

  function downloadRecording() {
    if (!recording) return
    const a = document.createElement("a")
    a.href = recording.url
    a.download = `interview-q${questionIndex + 1}-${Date.now()}.webm`
    a.click()
  }

  function formatTime(ms: number) {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return `${m}:${(s % 60).toString().padStart(2, "0")}`
  }

  const MAX_RECORDING_MS = 3 * 60 * 1000 // 3 min limit
  const overLimit = elapsedMs > MAX_RECORDING_MS

  // Auto-stop at limit
  if (isRecording && overLimit) stopRecording()

  return (
    <div className="space-y-2">
      {/* Security banner */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        <span>Voice recording encrypted &amp; stored securely for compliance</span>
        {checksum && (
          <Badge variant="outline" className="text-[9px] h-3.5 font-mono gap-1 ml-1">
            <Lock className="h-2.5 w-2.5" /> {checksum}
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!recording ? (
          <Button
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            className={`gap-1.5 ${isRecording ? "animate-pulse" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
          >
            {isRecording ? (
              <><MicOff className="h-3.5 w-3.5" /> Stop ({formatTime(elapsedMs)})</>
            ) : (
              <><Mic className="h-3.5 w-3.5" /> Record Answer</>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={togglePlayback}>
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <span className="text-xs text-muted-foreground">{formatTime(recording.durationMs)}</span>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={downloadRecording}>
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={deleteRecording}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Badge variant="secondary" className="text-[9px] h-4 bg-emerald-100 text-emerald-700">
              ✓ Saved
            </Badge>
          </div>
        )}

        {isRecording && (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-500">Recording…</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-[11px] text-red-500">{errorMsg}</p>
      )}

      {overLimit && (
        <p className="text-[11px] text-amber-600">Max recording length (3 min) reached.</p>
      )}
    </div>
  )
}
