// ============================================================
// API ROUTE: /api/send-email
// Purpose: Gmail se patient request nurses ko email bhejna
// Uses: Nodemailer + Gmail SMTP App Password
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const {
      patientName,
      phone,
      address,
      problem,
      aiSummary,
      mode,
      nurseEmails,
    }: {
      patientName: string
      phone: string
      address: string
      problem: string
      aiSummary?: string
      mode: "temporary" | "longterm"
      nurseEmails: string[]
    } = await req.json()

    if (!patientName || !problem || !nurseEmails || nurseEmails.length === 0) {
      return NextResponse.json(
        { error: "patientName, problem aur nurseEmails required hain" },
        { status: 400 }
      )
    }

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 20px; }
            .card { background: #fff; border-radius: 12px; max-width: 580px; margin: auto; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #0f766e, #0ea5e9); border-radius: 8px; padding: 18px 22px; margin-bottom: 22px; }
            .header h1 { color: #fff; margin: 0; font-size: 20px; }
            .header p { color: #e0f2fe; margin: 6px 0 0; font-size: 13px; }
            .row { margin-bottom: 14px; border-bottom: 1px solid #f3f4f6; padding-bottom: 14px; }
            .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
            .value { font-size: 15px; color: #111827; font-weight: 500; }
            .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .badge-temp { background: #fef3c7; color: #d97706; }
            .badge-long { background: #dbeafe; color: #1d4ed8; }
            .ai-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; white-space: pre-wrap; font-size: 13px; color: #166534; line-height: 1.6; }
            .footer { margin-top: 24px; text-align: center; font-size: 12px; color: #9ca3af; }
            .btn { display: inline-block; margin-top: 20px; padding: 13px 32px; background: #0f766e; color: #fff !important; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>🏥 NurseConnect &mdash; Naya Patient Request</h1>
              <p>Ek patient ne aapki seva maangi hai. Neeche poori details hain.</p>
            </div>

            <div class="row">
              <div class="label">Patient Ka Naam</div>
              <div class="value">👤 ${patientName}</div>
            </div>

            <div class="row">
              <div class="label">Phone Number</div>
              <div class="value">📞 ${phone || "N/A"}</div>
            </div>

            <div class="row">
              <div class="label">Address</div>
              <div class="value">📍 ${address || "N/A"}</div>
            </div>

            <div class="row">
              <div class="label">Seva Ka Prakar</div>
              <div class="value">
                <span class="badge ${mode === "temporary" ? "badge-temp" : "badge-long"}">
                  ${mode === "temporary" ? "⚡ Temporary / Ek-baar Visit" : "📅 Long-term Care"}
                </span>
              </div>
            </div>

            <div class="row">
              <div class="label">Patient Ki Samasya</div>
              <div class="value">${problem}</div>
            </div>

            ${aiSummary ? `
            <div class="row">
              <div class="label">🤖 AI Analysis</div>
              <div class="ai-box">${aiSummary}</div>
            </div>` : ""}

            <div style="text-align:center; padding-top: 8px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/nurse-portal" class="btn">
                🩺 Nurse Portal Mein Accept Karen &rarr;
              </a>
            </div>

            <div class="footer">
              Yeh email NurseConnect platform se automatically bheja gaya hai.<br/>
              &copy; ${new Date().getFullYear()} NurseConnect &mdash; Home Healthcare Platform
            </div>
          </div>
        </body>
      </html>
    `

    const result = await transporter.sendMail({
      from: `"NurseConnect" <${process.env.GMAIL_USER}>`,
      to: nurseEmails.join(", "),
      subject: `🏥 Naya Request: ${patientName} — ${mode === "temporary" ? "Urgent Visit" : "Long-term Care"}`,
      html: htmlBody,
      text: `NurseConnect - Naya Patient Request\n\nPatient: ${patientName}\nPhone: ${phone}\nAddress: ${address}\nMode: ${mode === "temporary" ? "Temporary" : "Long-term"}\nProblem: ${problem}\n\n${aiSummary || ""}\n\nNurse Portal: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/nurse-portal`,
    })

    console.log("[send-email] Bheja:", result.messageId, "| Nurses:", nurseEmails.length)

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: nurseEmails.length,
    })
  } catch (error) {
    console.error("[send-email] Error:", error)
    return NextResponse.json(
      { error: "Email nahi bheja ja saka. Gmail credentials check karen." },
      { status: 500 }
    )
  }
}
