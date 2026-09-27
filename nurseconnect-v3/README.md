# NurseConnect — v3 (Full Backend + Real AI)

India's AI-powered home nursing platform. This version has **complete backend** and **real Gemini AI agents**.

---

## What's New in v3

### ✅ 4 Secure Next.js API Routes (Server-Side)
| Route | Purpose |
|---|---|
| `POST /api/interview` | Gemini AI clinical interview for nurse vetting |
| `POST /api/triage` | Real AI symptom triage for patients |
| `POST /api/summarize` | AI patient summary for nurses |
| `POST /api/nurse-match` | AI nurse-to-patient matching |

### ✅ Real Gemini AI Agents
- **Dr. Meera Krishnan AI** — 5-question clinical interview with real evaluation
- **Health Triage Bot** — Real symptom analysis in Hindi/English/Hinglish
- **Patient Summarizer** — AI briefings for nurses before visits
- **Nurse Matcher** — AI ranks nurses by patient need

### ✅ Firebase Backend (Real-time)
- Firebase Realtime Database for nurse requests
- Anonymous Auth for users
- FCM Push Notifications
- Verified nurse storage

### ✅ Security
- API key NEVER exposed to client (server-side only)
- All Gemini calls go through `/api/*` routes
- Zod validation on all inputs

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and fill in:
- `GEMINI_API_KEY` — Get from Google AI Studio
- `NEXT_PUBLIC_FIREBASE_*` — Get from Firebase Console

### 3. Firebase Setup
1. Go to https://console.firebase.google.com
2. Create new project
3. Enable **Realtime Database** (set rules to allow read/write for dev)
4. Enable **Authentication** → Anonymous
5. Enable **Cloud Messaging** (for push notifications)
6. Copy config values to `.env.local`

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## Architecture

```
app/
├── page.tsx              # Login (Patient / Nurse)
├── patient/              # Patient dashboard
├── nurse/                # Nurse dashboard
├── nurse-portal/         # Nurse portal
├── vetting/              # AI nurse vetting flow
└── api/
    ├── interview/        # ← Gemini AI interview (SECURE)
    ├── triage/           # ← Gemini AI symptom triage (SECURE)
    ├── summarize/        # ← Gemini AI patient summary (SECURE)
    └── nurse-match/      # ← Gemini AI nurse matching (SECURE)

lib/
├── firebase.ts           # Firebase (env-based config)
├── interview-service.ts  # Interview state management
├── ai-helpers.ts         # Client-side API wrappers
├── vetting-types.ts      # Zod schemas + TypeScript types
└── app-context.tsx       # Global state

components/
├── health/chatbot-interface.tsx   # Real AI triage chat
├── vetting/ai-interview-chat.tsx  # Real AI interview
└── ...
```

---

## AI Models Used
- **gemini-3.1-flash-lite-preview** for all AI features

---

## Tech Stack
- Next.js 16 + React 19 + TypeScript
- Firebase (Realtime DB + Auth + FCM)
- Google Gemini API
- Tailwind CSS + shadcn/ui
- Zod validation
