import { NextResponse } from "next/server";
import { getAllInvoices, createPayPalInvoice } from "@/lib/paypal";
import { analyzeTransactionForFraud } from "@/lib/fraudDetector";

export async function GET() {
  const invoices = getAllInvoices();
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipient_email, recipient_name, items, currency, due_days } = body;

    if (!recipient_email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields (recipient_email and items list)" },
        { status: 400 }
      );
    }

    const invoice = await createPayPalInvoice({
      recipient_email,
      recipient_name: recipient_name || recipient_email.split("@")[0],
      items,
      currency: currency || "USD",
      due_days: due_days || 14,
    });

    // Check for fraud anomalies automatically
    analyzeTransactionForFraud({
      amount: invoice.amount,
      recipientEmail: recipient_email,
      recipientName: recipient_name,
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("API error creating invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
