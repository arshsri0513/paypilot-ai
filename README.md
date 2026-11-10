# PayPilot AI 🚀

> **Autonomous PayPal Financial Agent & Real-Time Fraud Sentinel for Small Businesses**  
> *Built for the PayPal AI Hackathon 2026*

---

## 🌟 Overview

**PayPilot AI** is an intelligent financial co-pilot built to liberate small business owners from manual billing friction and protect them from transaction fraud. By combining **PayPal's Invoicing & Webhook APIs** with **agentic AI**, PayPilot empowers merchants to generate, dispatch, track, and reconcile payments using natural conversation.

---

## ✨ Core Features

1. **🗣️ Conversational Invoicing via PayPal API**
   - Say *"Bill client@example.com $1,250 for design services due in 14 days"*.
   - Automatically drafts and transmits verified invoices via the **PayPal Invoicing REST API v2**.
2. **🛡️ Real-Time Fraud & Anomaly Sentinel**
   - Continuously monitors incoming transactions for high-risk attributes: disposable email domains, abnormal volume velocities, and geographic mismatch signatures.
   - Assigns dynamic 0–100 risk scores with actionable mitigation steps.
3. **⚡ Instant Payment Reconciliation via Webhooks**
   - Listens for `INVOICING.INVOICE.PAID` and `PAYMENT.CAPTURE.COMPLETED` events.
   - Instantly reflects real-time settlement status on the merchant dashboard.
4. **📊 Conversational Cash Flow Intelligence**
   - Query receivables, pending balances, and settlement reports via natural language.

---

## 🏗️ Architecture

```
[ Merchant / User ]
        │  (Natural Language Prompt)
        ▼
[ PayPilot AI Agent (Next.js Edge / Node Runtime) ]
        │
   ┌────┴─────────────────────────────┐
   ▼                                  ▼
[ PayPal Invoicing REST API ]    [ Anomaly & Fraud Sentinel ]
   │ (Create / Send / Read)           │ (Velocity / Domain / Geo)
   ▼                                  ▼
[ PayPal Sandbox Network ]       [ Real-time Risk Score Feed ]
   │
   ▼ (Webhooks: INVOICING.INVOICE.PAID)
[ /api/paypal/webhook ] ──► [ Live Merchant Dashboard ]
```

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/arshsri0513/paypilot-ai.git
cd paypilot-ai

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Deployment to Vercel

1. Push this repository to GitHub: `https://github.com/arshsri0513/paypilot-ai`
2. Navigate to your [Vercel Dashboard](https://vercel.com/arshsri0513s-projects).
3. Click **"Add New... -> Project"** and select `paypilot-ai`.
4. (Optional) Add your PayPal Sandbox credentials in Environment Variables:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_API_BASE` (`https://api-m.sandbox.paypal.com`)
5. Click **Deploy**. Your app is immediately live with automated SSL!

---

## 📄 License
Open source under the Apache-2.0 or MIT license.
