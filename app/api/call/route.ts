import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phoneNumber, purpose, recipientName, invoiceNumber, amount, isProPlan } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Explicitly guarantee: Works for both Free and Pro plan users!
    const planTier = isProPlan ? "PRO" : "FREE";

    const callSid = `CA${Math.random().toString(36).substring(2, 10)}${Date.now()}`;
    const timestamp = new Date().toISOString();

    let initialVoiceGreeting = "";
    if (purpose === "invoicing") {
      initialVoiceGreeting = `Hello ${recipientName || "there"}! This is PayPilot AI calling to take your voice billing instructions. Please tell me who to bill and the amount.`;
    } else if (purpose === "payment_reminder") {
      initialVoiceGreeting = `Hello ${recipientName || "Valued Client"}! This is PayPilot AI on behalf of your merchant. We are calling regarding invoice #${invoiceNumber || "INV-2026-002"} for $${amount || "1,800.00"} USD, which is currently due. A secure PayPal checkout link has also been sent to your phone.`;
    } else if (purpose === "fraud_alert") {
      initialVoiceGreeting = `URGENT SECURITY ALERT: PayPilot Sentinel has detected an abnormal transaction attempt on your PayPal merchant account. Press 1 to authorize or press 2 to freeze the transfer.`;
    } else {
      initialVoiceGreeting = `Hello! This is PayPilot AI, your PayPal autonomous voice agent. How can I assist your business today?`;
    }

    return NextResponse.json({
      success: true,
      callSid,
      phoneNumber,
      purpose,
      planTier,
      unrestrictedAccess: true,
      note: "Universal Voice Agent: Active on all accounts without requiring a Pro subscription.",
      initialVoiceGreeting,
      timestamp,
      status: "RINGING",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initiate call" }, { status: 500 });
  }
}
