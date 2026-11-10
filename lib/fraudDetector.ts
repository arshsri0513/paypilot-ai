import { FraudAlert, Invoice } from "./types";

let mockAlerts: FraudAlert[] = [
  {
    id: "FRD-101",
    transaction_id: "TXN-9021-PP",
    invoice_id: "INV2-DEMO-9914",
    severity: "HIGH",
    score: 87,
    title: "Suspicious Disposable Domain & Velocity Spike",
    description: "Invoice created to disposable-mail.org for $4,999 with 0 prior history and rapid IP switching.",
    reasons: [
      "Recipient domain matches known disposable mail registry",
      "Transaction amount ($4,999) is 340% higher than average merchant ticket",
      "Geographic IP origin mismatch (US billing, foreign proxy gateway)",
    ],
    suggested_action: "Hold funds release, require two-factor identity proof or phone confirmation before delivery.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "REVIEW_NEEDED",
  },
  {
    id: "FRD-102",
    transaction_id: "TXN-8812-PP",
    severity: "MEDIUM",
    score: 54,
    title: "Unusual Rapid Refund Request Pattern",
    description: "Buyer initiated payment and immediately requested custom refund route.",
    reasons: ["Rapid dispute trigger within 4 minutes of authorization"],
    suggested_action: "Verify buyer authenticity through PayPal Resolution Center.",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: "FLAGGED",
  },
];

export function getFraudAlerts(): FraudAlert[] {
  return mockAlerts;
}

export function analyzeTransactionForFraud(params: {
  amount: number;
  recipientEmail: string;
  recipientName?: string;
  countryCode?: string;
}): FraudAlert | null {
  const reasons: string[] = [];
  let score = 15; // baseline risk score

  const disposableDomains = [
    "disposable-mail.org",
    "tempmail.com",
    "mailinator.com",
    "10minutemail.com",
    "guerrillamail.com",
  ];

  const domain = params.recipientEmail.split("@")[1]?.toLowerCase() || "";
  if (disposableDomains.some((d) => domain.includes(d))) {
    reasons.push(`Disposable/throwaway email domain detected (@${domain})`);
    score += 45;
  }

  if (params.amount >= 4000) {
    reasons.push(`High transaction amount ($${params.amount.toFixed(2)}) surpasses SMB threshold`);
    score += 25;
  }

  if (params.amount > 10000) {
    reasons.push("Extreme single-ticket transfer velocity alert");
    score += 30;
  }

  if (score >= 40) {
    const alert: FraudAlert = {
      id: `FRD-${Math.floor(100 + Math.random() * 900)}`,
      transaction_id: `TXN-${Math.floor(1000 + Math.random() * 9000)}-PP`,
      severity: score >= 75 ? "HIGH" : "MEDIUM",
      score: Math.min(score, 99),
      title: score >= 75 ? "High Risk Transaction Pattern Detected" : "Moderate Risk Flag",
      description: `Automated sentinel flagged potential anomaly for ${params.recipientEmail} (${params.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}).`,
      reasons,
      suggested_action: score >= 75
        ? "Withhold fulfillment until buyer identity and funds are fully settled."
        : "Review client payment history before sending recurring automated reminders.",
      timestamp: new Date().toISOString(),
      status: "REVIEW_NEEDED",
    };
    mockAlerts.unshift(alert);
    return alert;
  }

  return null;
}
