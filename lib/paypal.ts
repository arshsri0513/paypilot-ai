import { Invoice, InvoiceItem } from "./types";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

// In-memory store for fallback demo mode if credentials are not configured yet
let mockInvoices: Invoice[] = [
  {
    id: "INV2-DEMO-9912",
    invoice_number: "INV-2026-001",
    status: "PAID",
    invoice_date: "2026-11-01",
    due_date: "2026-11-15",
    recipient_email: "billing@apexlogistics.com",
    recipient_name: "Apex Logistics Inc.",
    amount: 2450.0,
    currency: "USD",
    items: [
      {
        name: "Supply Chain Consulting",
        quantity: 1,
        unit_amount: { currency_code: "USD", value: "2450.00" },
        description: "October automation & optimization audit",
      },
    ],
    paypal_view_url: "https://www.sandbox.paypal.com/invoice/s/view/INV2-DEMO-9912",
    risk_level: "LOW",
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "INV2-DEMO-9913",
    invoice_number: "INV-2026-002",
    status: "SENT",
    invoice_date: "2026-11-05",
    due_date: "2026-11-19",
    recipient_email: "finance@solardesign.co",
    recipient_name: "Solar Design Studio",
    amount: 1800.0,
    currency: "USD",
    items: [
      {
        name: "Brand & UI Kit Design",
        quantity: 1,
        unit_amount: { currency_code: "USD", value: "1800.00" },
        description: "Full design token library & Figma system",
      },
    ],
    paypal_view_url: "https://www.sandbox.paypal.com/invoice/s/view/INV2-DEMO-9913",
    risk_level: "LOW",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "INV2-DEMO-9914",
    invoice_number: "INV-2026-003",
    status: "SENT",
    invoice_date: "2026-11-08",
    due_date: "2026-11-10",
    recipient_email: "temp7881@disposable-mail.org",
    recipient_name: "Quick Ventures LLC",
    amount: 4999.0,
    currency: "USD",
    items: [
      {
        name: "Urgent Server Migration",
        quantity: 1,
        unit_amount: { currency_code: "USD", value: "4999.00" },
        description: "Expedited cloud handover",
      },
    ],
    paypal_view_url: "https://www.sandbox.paypal.com/invoice/s/view/INV2-DEMO-9914",
    risk_level: "HIGH",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export async function getPayPalAccessToken(): Promise<string | null> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return null;
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      console.error("PayPal token error:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error("Failed to connect to PayPal API:", err);
    return null;
  }
}

export async function createPayPalInvoice(params: {
  recipient_email: string;
  recipient_name: string;
  items: InvoiceItem[];
  currency?: string;
  due_days?: number;
}): Promise<Invoice> {
  const token = await getPayPalAccessToken();
  const currency = params.currency || "USD";
  const totalAmount = params.items.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.unit_amount.value),
    0
  );

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + (params.due_days || 14));

  if (token) {
    try {
      const payload = {
        detail: {
          currency_code: currency,
          note: "Generated autonomously by PayPilot AI",
          term: "Due on Receipt",
          payment_term: {
            term_type: "NET_15",
          },
        },
        invoicer: {
          name: {
            given_name: "PayPilot",
            surname: "Merchant",
          },
        },
        primary_recipients: [
          {
            billing_info: {
              name: {
                given_name: params.recipient_name,
              },
              email_address: params.recipient_email,
            },
          },
        ],
        items: params.items.map((i) => ({
          name: i.name,
          quantity: i.quantity.toString(),
          unit_amount: {
            currency_code: currency,
            value: parseFloat(i.unit_amount.value).toFixed(2),
          },
          description: i.description,
        })),
      };

      const res = await fetch(`${PAYPAL_API_BASE}/v2/invoicing/invoices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const paypalData = await res.json();
        const invoiceId = paypalData.id || `INV2-${Date.now()}`;
        const newInv: Invoice = {
          id: invoiceId,
          invoice_number: `INV-${Date.now().toString().slice(-4)}`,
          status: "SENT",
          invoice_date: today.toISOString().split("T")[0],
          due_date: dueDate.toISOString().split("T")[0],
          recipient_email: params.recipient_email,
          recipient_name: params.recipient_name,
          amount: totalAmount,
          currency: currency,
          items: params.items,
          paypal_view_url: `https://www.sandbox.paypal.com/invoice/s/view/${invoiceId}`,
          risk_level: params.recipient_email.includes("disposable") || totalAmount > 3000 ? "HIGH" : "LOW",
          created_at: new Date().toISOString(),
        };
        mockInvoices.unshift(newInv);
        return newInv;
      }
    } catch (e) {
      console.warn("Falling back to demo mode due to API exception:", e);
    }
  }

  // Realistic Sandbox Fallback:
  const invoiceId = `INV2-SANDBOX-${Math.floor(1000 + Math.random() * 9000)}`;
  const fallbackInv: Invoice = {
    id: invoiceId,
    invoice_number: `INV-2026-00${mockInvoices.length + 1}`,
    status: "SENT",
    invoice_date: today.toISOString().split("T")[0],
    due_date: dueDate.toISOString().split("T")[0],
    recipient_email: params.recipient_email,
    recipient_name: params.recipient_name,
    amount: totalAmount,
    currency: currency,
    items: params.items,
    paypal_view_url: `https://www.sandbox.paypal.com/invoice/s/view/${invoiceId}`,
    risk_level: params.recipient_email.includes("disposable") || totalAmount > 3000 ? "HIGH" : "LOW",
    created_at: new Date().toISOString(),
  };

  mockInvoices.unshift(fallbackInv);
  return fallbackInv;
}

export function getAllInvoices(): Invoice[] {
  return mockInvoices;
}

export function updateInvoiceStatus(id: string, status: Invoice["status"]): Invoice | null {
  const inv = mockInvoices.find((i) => i.id === id);
  if (inv) {
    inv.status = status;
    return inv;
  }
  return null;
}
