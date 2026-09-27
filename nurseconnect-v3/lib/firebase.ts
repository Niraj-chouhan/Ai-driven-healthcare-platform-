// ============================================================
// LOCAL APP DATA LAYER - NurseConnect
// Firebase auth, realtime DB, and FCM are intentionally disabled.
// This file preserves the old API surface with local/dummy behavior.
// ============================================================

type RequestRecord = Record<string, any>

const LOCAL_KEYS = {
  requests: "nurseconnect.local.requests",
  notifications: "nurseconnect.local.notifications",
  nurses: "nurseconnect.local.nurses",
  verifiedNurses: "nurseconnect.local.verified-nurses",
  pushToken: "nurseconnect.local.push-token",
}

function canUseStorage() {
  return typeof window !== "undefined"
}

function readList<T>(key: string): T[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeList<T>(key: string, value: T[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function emitStorageUpdate(key: string) {
  if (!canUseStorage()) return
  window.dispatchEvent(new CustomEvent(`nurseconnect:${key}`))
}

function createDummyId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function signInAnon() {
  return createDummyId("guest")
}

export function listenToRequests(callback: (requests: any[]) => void) {
  const run = () => {
    const records = readList<RequestRecord>(LOCAL_KEYS.requests).map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt || Date.now()),
    }))
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    callback(records)
  }

  run()
  if (!canUseStorage()) return () => {}

  const onStorage = () => run()
  const onCustom = () => run()
  window.addEventListener("storage", onStorage)
  window.addEventListener(`nurseconnect:${LOCAL_KEYS.requests}`, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(`nurseconnect:${LOCAL_KEYS.requests}`, onCustom)
  }
}

export async function createRequestInDB(request: any) {
  const requests = readList<RequestRecord>(LOCAL_KEYS.requests)
  const reqData = {
    ...request,
    id: request.id ?? createDummyId("REQ"),
    createdAt: new Date().toISOString(),
    status: request.status ?? "matched",
  }
  requests.unshift(reqData)
  writeList(LOCAL_KEYS.requests, requests)
  emitStorageUpdate(LOCAL_KEYS.requests)
  return reqData
}

export async function updateRequestInDB(id: string, updates: any) {
  const requests = readList<RequestRecord>(LOCAL_KEYS.requests).map((item) =>
    item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item,
  )
  writeList(LOCAL_KEYS.requests, requests)
  emitStorageUpdate(LOCAL_KEYS.requests)
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return null
  const token = createDummyId("push")
  window.localStorage.setItem(LOCAL_KEYS.pushToken, token)
  return token
}

export function saveFCMToken(_userId: string, token: string, _role: string) {
  if (!canUseStorage()) return Promise.resolve()
  window.localStorage.setItem(LOCAL_KEYS.pushToken, token)
  return Promise.resolve()
}

export function listenForFCMMessages(_callback: (payload: any) => void) {
  return () => {}
}

export function listenToNotifications(userId: string, callback: (notifs: any[]) => void) {
  const run = () => {
    const notifications = readList<any>(`${LOCAL_KEYS.notifications}:${userId}`).filter((item) => !item.read)
    callback(notifications)
  }

  run()
  if (!canUseStorage()) return () => {}

  const eventName = `nurseconnect:${LOCAL_KEYS.notifications}:${userId}`
  const onStorage = () => run()
  const onCustom = () => run()
  window.addEventListener("storage", onStorage)
  window.addEventListener(eventName, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(eventName, onCustom)
  }
}

export function listenToNurseStatus(nurseId: string, callback: (isOnDuty: boolean) => void) {
  const run = () => {
    const nurses = readList<any>(LOCAL_KEYS.nurses)
    const nurse = nurses.find((item) => item.id === nurseId)
    callback(nurse?.isOnDuty ?? false)
  }

  run()
  if (!canUseStorage()) return () => {}

  const onStorage = () => run()
  const onCustom = () => run()
  window.addEventListener("storage", onStorage)
  window.addEventListener(`nurseconnect:${LOCAL_KEYS.nurses}`, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(`nurseconnect:${LOCAL_KEYS.nurses}`, onCustom)
  }
}

export function updateNurseStatus(nurseId: string, isOnDuty: boolean) {
  const nurses = readList<any>(LOCAL_KEYS.nurses)
  const next = nurses.some((item) => item.id === nurseId)
    ? nurses.map((item) => (item.id === nurseId ? { ...item, isOnDuty, lastUpdated: new Date().toISOString() } : item))
    : [...nurses, { id: nurseId, isOnDuty, lastUpdated: new Date().toISOString() }]
  writeList(LOCAL_KEYS.nurses, next)
  emitStorageUpdate(LOCAL_KEYS.nurses)
  return Promise.resolve()
}

export async function saveVerifiedNurse(nurseData: any) {
  const nurses = readList<any>(LOCAL_KEYS.verifiedNurses)
  const next = [...nurses.filter((item) => item.id !== nurseData.id), { ...nurseData, verifiedAt: new Date().toISOString() }]
  writeList(LOCAL_KEYS.verifiedNurses, next)
  emitStorageUpdate(LOCAL_KEYS.verifiedNurses)
}

export function listenToVerifiedNurses(callback: (nurses: any[]) => void) {
  const run = () => callback(readList<any>(LOCAL_KEYS.verifiedNurses))
  run()
  if (!canUseStorage()) return () => {}

  const onStorage = () => run()
  const onCustom = () => run()
  window.addEventListener("storage", onStorage)
  window.addEventListener(`nurseconnect:${LOCAL_KEYS.verifiedNurses}`, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(`nurseconnect:${LOCAL_KEYS.verifiedNurses}`, onCustom)
  }
}
