"use client"

import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, type ReactNode
} from "react"

import {
  signInAnon,
  listenToRequests, createRequestInDB, updateRequestInDB,
  requestNotificationPermission, saveFCMToken,
  listenForFCMMessages,
  listenToNotifications, updateNurseStatus,
} from "./firebase"

export type UserRole = "patient" | "nurse" | null
export interface Message {
  id: string; role: "user" | "assistant"; content: string; timestamp: Date
}
export type BookingMode = "temporary" | "longterm"
export type RequestStatus =
  | "pending" | "matched" | "accepted" | "interview_sent"
  | "in-progress" | "completed" | "cancelled"

export interface NurseRequest {
  id: string; patientId: string; patientName: string
  phone: string; address: string; problem: string
  aiSummary?: string; mode: BookingMode; status: RequestStatus
  matchedNurses: Nurse[]; acceptedNurseId?: string
  createdAt: Date; eta?: number; attachments?: string[]
}

export interface Nurse {
  id: string; name: string; rating: number
  specializations: string[]; verified: boolean; isOnDuty: boolean
  location: { lat: number; lng: number }; eta?: number
  phone?: string; email?: string; earnings: number
  visitsToday: number; experience?: string; address?: string
}

export interface PatientProfile {
  name: string; phone: string; email: string; address?: string; bloodGroup?: string
}
export interface NurseProfile {
  name: string; phone: string; email: string
  specializations: string[]; experience: string; address: string; city: string; cvFileName?: string
}

export interface PendingNurse {
  id: string; name: string; location: string; experience: string
  submittedAt: string; specializations: string[]
  documents: { nursingCert: boolean; idProof: boolean; cvUploaded: boolean }
  status: "pending" | "approved" | "rejected"
}

export interface Notification {
  id: string; type: "success" | "warning" | "error" | "info"
  title: string; message: string; timestamp: Date
}

const MOCK_NURSES: Nurse[] = [
  { id: "n1", name: "Priya Sharma", rating: 4.9, specializations: ["General Care", "Injections"], verified: true, isOnDuty: true, location: { lat: 28.5721, lng: 77.3218 }, eta: 8, phone: "+91 98765 00001", email: "priya@gmail.com", earnings: 800, visitsToday: 3, experience: "5 years", address: "Sector 12, Noida" },
  { id: "n2", name: "Rajesh Kumar", rating: 4.8, specializations: ["Elder Care", "Physiotherapy"], verified: true, isOnDuty: true, location: { lat: 28.5655, lng: 77.3178 }, eta: 12, phone: "+91 98765 00002", email: "rajesh@gmail.com", earnings: 650, visitsToday: 2, experience: "7 years", address: "Vasundhara, Ghaziabad" },
  { id: "n3", name: "Anita Mehta", rating: 4.9, specializations: ["Pediatric", "Neonatal"], verified: true, isOnDuty: true, location: { lat: 28.5690, lng: 77.3250 }, eta: 15, phone: "+91 98765 00003", email: "anita@gmail.com", earnings: 950, visitsToday: 4, experience: "9 years", address: "Indirapuram, Ghaziabad" },
]

const MOCK_PENDING: PendingNurse[] = [
  { id: "NRS-001", name: "Anjali Patel", location: "Jaipur, Rajasthan", experience: "5 years", submittedAt: "2 hours ago", specializations: ["ICU", "Emergency"], documents: { nursingCert: true, idProof: true, cvUploaded: true }, status: "pending" },
  { id: "NRS-002", name: "Meera Singh", location: "Delhi NCR", experience: "3 years", submittedAt: "4 hours ago", specializations: ["General"], documents: { nursingCert: true, idProof: true, cvUploaded: false }, status: "pending" },
]

interface AppContextType {
  userRole: UserRole; setUserRole: (role: UserRole) => void
  userName: string; setUserName: (name: string) => void
  userId: string | null
  patientProfile: PatientProfile | null; setPatientProfile: (p: PatientProfile) => void
  nurseProfile: NurseProfile | null; setNurseProfile: (p: NurseProfile) => void
  messages: Message[]
  addMessage: (content: string, role: "user" | "assistant") => void
  clearMessages: () => void
  nurseRequests: NurseRequest[]
  createRequest: (req: Omit<NurseRequest, "id" | "createdAt" | "matchedNurses" | "status">) => Promise<NurseRequest>
  updateRequest: (id: string, updates: Partial<NurseRequest>) => void
  activeRequest: NurseRequest | null; setActiveRequest: (req: NurseRequest | null) => void
  currentNurse: Nurse | null; setCurrentNurse: (nurse: Nurse | null) => void
  setNurseOnDuty: (isOnDuty: boolean) => void
  pendingNurses: PendingNurse[]; approveNurse: (id: string) => void; rejectNurse: (id: string) => void
  notifications: Notification[]
  addNotification: (n: Omit<Notification, "id" | "timestamp">) => void
  clearNotification: (id: string) => void
  fcmToken: string | null
  notificationPermission: string
  requestPushPermission: () => Promise<void>
  isFirebaseConnected: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null)
  const [nurseProfile, setNurseProfile] = useState<NurseProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([{ id: "1", role: "assistant", content: "Hello 💙 I'm here with you.\n\nYou can chat in English. Tell me how you're feeling.\n\n(The mic button also works 🎤)", timestamp: new Date() }])
  const [nurseRequests, setNurseRequests] = useState<NurseRequest[]>([])
  const [activeRequest, setActiveRequest] = useState<NurseRequest | null>(null)
  const [currentNurse, setCurrentNurse] = useState<Nurse | null>(MOCK_NURSES[0])
  const [pendingNurses, setPendingNurses] = useState<PendingNurse[]>(MOCK_PENDING)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState("default")
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false)
  const notifTimers = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    signInAnon().then((uid) => {
      if (uid) {
        setUserId(uid)
        setIsFirebaseConnected(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!isFirebaseConnected) return
    const unsub = listenToRequests((requests) => { setNurseRequests(requests) })
    return () => unsub()
  }, [isFirebaseConnected])

  useEffect(() => {
    if (!isFirebaseConnected) return
    const unsub = listenForFCMMessages((payload: any) => {
      addNotification({
        type: "info",
        title: payload.notification?.title || "SevaSetu",
        message: payload.notification?.body || "You have a new update",
      })
    })
    return () => { if (typeof unsub === "function") unsub() }
  }, [isFirebaseConnected])

  useEffect(() => {
    if (!isFirebaseConnected || !userId) return
    const unsub = listenToNotifications(userId, (dbNotifs: any[]) => {
      dbNotifs.forEach((n) => {
        addNotification({ type: n.type || "info", title: n.title, message: n.message })
      })
    })
    return () => unsub()
  }, [isFirebaseConnected, userId])

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  async function requestPushPermission() {
    const token = await requestNotificationPermission()
    if (token && userId) {
      setFcmToken(token)
      setNotificationPermission("granted")
      await saveFCMToken(userId, token, userRole || "unknown")
      addNotification({ type: "success", title: "Notifications Active! 🔔", message: "You will receive real push notifications even if the app is closed." })
    }
  }

  const addMessage = useCallback((content: string, role: "user" | "assistant") => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, timestamp: new Date() }])
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([{ id: "1", role: "assistant", content: "Hello 💙 I'm here with you.\nYou can chat in English or Hindi. Just type what you need.", timestamp: new Date() }])
  }, [])

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp">) => {
    const id = Date.now().toString() + Math.random()
    const notif: Notification = { ...n, id, timestamp: new Date() }
    setNotifications(prev => [...prev, notif])
    notifTimers.current[id] = setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== notif.id))
      delete notifTimers.current[id]
    }, 6000)
  }, [])

  const clearNotification = useCallback((id: string) => {
    if (notifTimers.current[id]) { clearTimeout(notifTimers.current[id]); delete notifTimers.current[id] }
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const createRequest = useCallback(async (req: Omit<NurseRequest, "id" | "createdAt" | "matchedNurses" | "status">): Promise<NurseRequest> => {
    const matched = MOCK_NURSES.filter(n => n.isOnDuty).slice(0, 3)
    const newReq: NurseRequest = { ...req, id: `REQ-${Date.now()}`, createdAt: new Date(), matchedNurses: matched, status: "matched" }
    try {
      if (isFirebaseConnected) {
        const savedReq = await createRequestInDB({ ...newReq, matchedNurses: matched.map(n => ({ ...n })), createdAt: new Date().toISOString() })
        const finalReq = { ...savedReq, createdAt: new Date(savedReq.createdAt) }
        setActiveRequest(finalReq)
        addNotification({ type: "info", title: "✅ Request Sent!", message: `${matched.length} nurses have been notified.` })
        return finalReq
      }
    } catch (error) { console.error("Firebase create error:", error) }
    setNurseRequests(prev => [newReq, ...prev])
    setActiveRequest(newReq)
    return newReq
  }, [isFirebaseConnected, addNotification])

  const updateRequest = useCallback(async (id: string, updates: Partial<NurseRequest>) => {
    setNurseRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    setActiveRequest(prev => prev?.id === id ? { ...prev, ...updates } : prev)
    try {
      if (isFirebaseConnected) {
        await updateRequestInDB(id, updates)
        if (updates.status === "accepted") addNotification({ type: "success", title: "🎉 Nurse Accepted!", message: "The nurse has confirmed your request." })
        else if (updates.status === "in-progress") addNotification({ type: "success", title: "🚀 Nurse On The Way!", message: "Your nurse is on her way." })
        else if (updates.status === "completed") addNotification({ type: "success", title: "✅ Visit Complete!", message: "Service completed. Please rate your experience." })
      }
    } catch (error) { console.error("Firebase update error:", error) }
  }, [isFirebaseConnected, addNotification])

  const setNurseOnDuty = useCallback(async (isOnDuty: boolean) => {
    setCurrentNurse(prev => prev ? { ...prev, isOnDuty } : prev)
    if (currentNurse && isFirebaseConnected) {
      try {
        await updateNurseStatus(currentNurse.id, isOnDuty)
        addNotification({ type: isOnDuty ? "success" : "info", title: isOnDuty ? "🟢 You are On Duty!" : "🔴 Off Duty", message: isOnDuty ? "New patient requests will arrive." : "No new requests will come." })
      } catch (e) { console.error("Status update error:", e) }
    }
  }, [currentNurse, isFirebaseConnected, addNotification])

  const approveNurse = useCallback((id: string) => {
    setPendingNurses(prev => prev.map(n => n.id === id ? { ...n, status: "approved" as const } : n))
    addNotification({ type: "success", title: "Nurse Approved ✅", message: "The nurse application has been approved." })
  }, [addNotification])

  const rejectNurse = useCallback((id: string) => {
    setPendingNurses(prev => prev.map(n => n.id === id ? { ...n, status: "rejected" as const } : n))
    addNotification({ type: "warning", title: "Application Rejected", message: "The nurse application was rejected." })
  }, [addNotification])

  return (
    <AppContext.Provider value={{
      userRole, setUserRole, userName, setUserName, userId,
      patientProfile, setPatientProfile, nurseProfile, setNurseProfile,
      messages, addMessage, clearMessages,
      nurseRequests, createRequest, updateRequest, activeRequest, setActiveRequest,
      currentNurse, setCurrentNurse, setNurseOnDuty,
      pendingNurses, approveNurse, rejectNurse,
      notifications, addNotification, clearNotification,
      fcmToken, notificationPermission, requestPushPermission, isFirebaseConnected,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
