import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/app-context'
import { NotificationToast } from '@/components/ui/notification-toast'
import { NotificationPermissionBanner, FirebaseStatusBadge } from '@/components/ui/firebase-notification-banner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SevaSetu — Verified Nurses On Demand',
  description: 'Book verified nurses at home. Real-time tracking, push notifications, AI-powered matching.',
  generator: 'sevasetu',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <AppProvider>
          <NotificationPermissionBanner />
          {children}
          <NotificationToast />
          <FirebaseStatusBadge />
        </AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
