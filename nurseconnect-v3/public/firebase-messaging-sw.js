// ============================================================
// FIREBASE MESSAGING SERVICE WORKER
// Yeh file background push notifications handle karta hai
// Jab app band ho tab bhi notifications aayengi
// ============================================================

// ⚠️ IMPORTANT: Apni Firebase config yahan daalo
// (Same config jo firebase.ts mein hai)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js")

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// Background message handler — jab app band ho
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload)

  const notificationTitle = payload.notification?.title || "SevaSetu"
  const notificationOptions = {
    body: payload.notification?.body || "Aapke liye ek naya update hai",
    icon: "/icon.svg",
    badge: "/icon-light-32x32.png",
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: "open", title: "App Kholo" },
      { action: "dismiss", title: "Dismiss" }
    ],
    requireInteraction: true, // Notification tab tak rahegi jab tak dismiss na ho
    tag: payload.data?.type || "sevasetu", // Avoid duplicate notifications of the same type
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "dismiss") return

  // App open karo ya focus karo
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Agar app already open hai
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      // Nahi to naya tab kholo
      if (clients.openWindow) {
        const url = event.notification.data?.url || "/"
        return clients.openWindow(url)
      }
    })
  )
})

// Install & activate
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})
