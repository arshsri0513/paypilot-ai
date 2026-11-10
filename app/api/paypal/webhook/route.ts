import { NextResponse } from "next/server";
import { updateInvoiceStatus, getAllInvoices } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const event = await req.json();
    const eventType = event.event_type;
    console.log(`[PayPal Webhook Received] Type: ${eventType}`, event.id);

    if (eventType === "INVOICING.INVOICE.PAID" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const invoiceId = resource?.invoice_id || resource?.id;
      if (invoiceId) {
        updateInvoiceStatus(invoiceId, "PAID");
      }
    }

    if (eventType === "CUSTOMER.DISPUTE.CREATED") {
      // Flag dispute automatically
      console.warn("Dispute alert received from PayPal!");
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    supported_events: [
      "INVOICING.INVOICE.PAID",
      "INVOICING.INVOICE.SENT",
      "PAYMENT.CAPTURE.COMPLETED",
      "CUSTOMER.DISPUTE.CREATED",
    ],
  });
}
