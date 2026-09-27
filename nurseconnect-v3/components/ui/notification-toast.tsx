"use client"

import { useApp } from "@/lib/app-context"
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react"
import { Button } from "./button"

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
}

const colorMap = {
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
}

const iconColorMap = {
  success: "text-green-600",
  warning: "text-amber-600",
  error: "text-red-600",
  info: "text-blue-600",
}

export function NotificationToast() {
  const { notifications, clearNotification } = useApp()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type]
        return (
          <div
            key={notification.id}
            className={`${colorMap[notification.type]} border rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 shrink-0 ${iconColorMap[notification.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-sm opacity-90 mt-0.5">{notification.message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 -mr-1 -mt-1"
                onClick={() => clearNotification(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
