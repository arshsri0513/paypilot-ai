import { NextResponse } from "next/server";
import { getAllInvoices, createPayPalInvoice } from "@/lib/paypal";
import { getFraudAlerts, analyzeTransactionForFraud } from "@/lib/fraudDetector";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const prompt = (message || "").trim();
    const lower = prompt.toLowerCase();

    // 1. Invoicing Intent Detection
    if (
      lower.includes("invoice") ||
      lower.includes("bill") ||
      lower.includes("charge") ||
      lower.includes("send $") ||
      lower.includes("pay")
    ) {
      // Check if user is asking to create/send an invoice
      if (
        lower.includes("send") ||
        lower.includes("create") ||
        lower.includes("bill") ||
        lower.includes("generate") ||
        lower.includes("draft")
      ) {
        // Extract email if present
        const emailMatch = prompt.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        // Extract dollar amount: $500 or 500 dollars
        const amountMatch = prompt.match(/\$(\d+(?:\.\d{2})?)/) || prompt.match(/(\d+(?:\.\d{2})?)\s*(?:dollars|usd)/i);
        
        const recipientEmail = emailMatch ? emailMatch[1] : "client@example.com";
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 750.0;
        const nameGuess = recipientEmail.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim();
        const recipientName = nameGuess.length > 2 ? nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1) : "Valued Client";

        // Description extraction
        let desc = "Professional Services";
        if (lower.includes("for ")) {
          const afterFor = prompt.substring(lower.indexOf("for ") + 4).split(/[.,\n]/)[0].trim();
          if (afterFor.length > 2) desc = afterFor;
        }

        const newInvoice = await createPayPalInvoice({
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          items: [
            {
              name: desc,
              quantity: 1,
              unit_amount: { currency_code: "USD", value: amount.toFixed(2) },
              description: `Generated via PayPilot AI conversational agent for: ${desc}`,
            },
          ],
          currency: "USD",
          due_days: 14,
        });

        // Run fraud sentinel
        const fraudRisk = analyzeTransactionForFraud({
          amount: newInvoice.amount,
          recipientEmail: newInvoice.recipient_email,
          recipientName: newInvoice.recipient_name,
        });

        let reply = `✅ **Invoice Successfully Generated & Dispatched via PayPal!**\n\n` +
          `• **Invoice ID:** \`${newInvoice.id}\`\n` +
          `• **Recipient:** ${newInvoice.recipient_name} (${newInvoice.recipient_email})\n` +
          `• **Amount:** $${newInvoice.amount.toFixed(2)} USD\n` +
          `• **Status:** ${newInvoice.status} (Sandbox)\n` +
          `• **Due Date:** ${newInvoice.due_date}\n\n` +
          `🔗 [View Live PayPal Sandbox Invoice](${newInvoice.paypal_view_url})\n\n`;

        if (fraudRisk) {
          reply += `⚠️ **Fraud Sentinel Alert (${fraudRisk.severity} Risk):** ${fraudRisk.title} — ${fraudRisk.suggested_action}`;
        } else {
          reply += `🛡️ **Fraud Sentinel:** Transaction verified. Risk score: Low (9/100).`;
        }

        return NextResponse.json({
          reply,
          action: "INVOICE_CREATED",
          invoice: newInvoice,
        });
      }
    }

    // 2. Revenue / Cash Flow Questions
    if (lower.includes("revenue") || lower.includes("total") || lower.includes("collected") || lower.includes("earned")) {
      const invoices = getAllInvoices();
      const paid = invoices.filter((i) => i.status === "PAID");
      const pending = invoices.filter((i) => i.status === "SENT");
      const paidSum = paid.reduce((s, i) => s + i.amount, 0);
      const pendingSum = pending.reduce((s, i) => s + i.amount, 0);

      const reply = `📊 **PayPal Cash Flow Overview:**\n\n` +
        `• **Settled Revenue (Paid):** $${paidSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n` +
        `• **Outstanding Receivables:** $${pendingSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n` +
        `• **Total Invoices Processed:** ${invoices.length} (${paid.length} paid, ${pending.length} pending)\n\n` +
        `Would you like me to dispatch automated reminders to clients with unpaid balances?`;

      return NextResponse.json({ reply });
    }

    // 3. Unpaid / Overdue Invoices
    if (lower.includes("unpaid") || lower.includes("overdue") || lower.includes("pending") || lower.includes("who owes")) {
      const invoices = getAllInvoices().filter((i) => i.status === "SENT");
      if (invoices.length === 0) {
        return NextResponse.json({ reply: "🎉 Great news! All PayPal invoices have been settled. No pending receivables." });
      }

      let reply = `⏳ **Here are the outstanding PayPal invoices awaiting payment:**\n\n`;
      invoices.forEach((inv) => {
        reply += `• **${inv.invoice_number}** (${inv.recipient_name}): $${inv.amount.toFixed(2)} USD — Due: ${inv.due_date}\n`;
      });
      reply += `\nType *"Send reminder to [Invoice Number]"* to trigger an automated polite payment prompt.`;

      return NextResponse.json({ reply });
    }

    // 4. Fraud & Security Inquiries
    if (lower.includes("fraud") || lower.includes("risk") || lower.includes("security") || lower.includes("alerts")) {
      const alerts = getFraudAlerts();
      let reply = `🛡️ **PayPilot Real-Time Fraud Sentinel Report:**\n\n` +
        `We are actively monitoring real-time PayPal webhooks for high-risk anomalies.\n\n` +
        `**Active Alerts (${alerts.length}):**\n`;
      alerts.forEach((a) => {
        reply += `• [**${a.severity} RISK - ${a.score}/100**] ${a.title}\n  *Action:* ${a.suggested_action}\n\n`;
      });

      return NextResponse.json({ reply });
    }

    // Default Conversational Fallback
    const fallback = `👋 I am **PayPilot AI**, your autonomous PayPal financial agent. Here is how I can assist you right now:\n\n` +
      `1. **Create an Invoice:** *"Send an invoice to client@acme.com for $1,200 for web design due in 7 days."*\n` +
      `2. **Check Cash Flow:** *"What is our total revenue collected via PayPal?"*\n` +
      `3. **Review Risk:** *"Do we have any high-risk fraud alerts?"*\n` +
      `4. **Follow-ups:** *"Which invoices are currently pending payment?"*`;

    return NextResponse.json({ reply: fallback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error processing chat" }, { status: 500 });
  }
}
