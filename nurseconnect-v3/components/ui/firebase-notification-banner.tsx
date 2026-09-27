"use client"

import { useEffect, useState } from "react"
import { Bell, X, Wifi, WifiOff } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function NotificationPermissionBanner() {
  const { notificationPermission, requestPushPermission } = useApp()
  const [dismissed, setDismissed] = useState(false)
  const [requesting, setRequesting] = useState(false)

  if (notificationPermission === "granted" || notificationPermission === "denied" || dismissed) {
    return null
  }

  async function handleAllow() {
    setRequesting(true)
    await requestPushPermission()
    setRequesting(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <Bell className="h-5 w-5 shrink-0 animate-bounce" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Enable Notifications</p>
          <p className="text-blue-100 text-xs">Allow browser notifications for alerts</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAllow}
            disabled={requesting}
            className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            {requesting ? "..." : "Allow"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function FirebaseStatusBadge() {
  const { isFirebaseConnected } = useApp()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-lg transition-all ${
        isFirebaseConnected ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
      }`}
    >
      {isFirebaseConnected ? (
        <>
          <Wifi className="h-3 w-3" /> Real-time Connected
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" /> Local Mode
        </>
      )}
    </div>
  )
}
