export interface InvoiceItem {
  name: string;
  quantity: number;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  description?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  status: "DRAFT" | "SENT" | "SCHEDULED" | "PAID" | "MARKED_AS_PAID" | "CANCELLED" | "REFUNDED";
  invoice_date: string;
  due_date: string;
  recipient_email: string;
  recipient_name: string;
  amount: number;
  currency: string;
  items: InvoiceItem[];
  paypal_view_url?: string;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
  created_at: string;
}

export interface FraudAlert {
  id: string;
  transaction_id: string;
  invoice_id?: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  score: number; // 0 to 100
  title: string;
  description: string;
  reasons: string[];
  suggested_action: string;
  timestamp: string;
  status: "REVIEW_NEEDED" | "FLAGGED" | "CLEARED";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
  actionRequired?: boolean;
  actionData?: any;
}
