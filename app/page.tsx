"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldAlert,
  Send,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  User,
  ArrowUpRight,
  RefreshCw,
  Zap,
  ExternalLink,
  ShieldCheck,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Mic,
  Volume2,
  Plus,
  Search,
  Filter,
  X,
  CreditCard,
  ChevronRight,
  Check,
} from "lucide-react";
import { Invoice, FraudAlert, ChatMessage } from "@/lib/types";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Plan State (Free by default, but voice calls work on BOTH!)
  const [userPlan, setUserPlan] = useState<"FREE" | "PRO">("FREE");
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("Professional Services");
  const [newAmount, setNewAmount] = useState("500.00");
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // Invoice Details Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Phone Call Modal & State
  const [showCallModal, setShowCallModal] = useState(false);
  const [callPhoneNumber, setCallPhoneNumber] = useState("+1 (555) 782-9912");
  const [callPurpose, setCallPurpose] = useState<"payment_reminder" | "invoicing" | "fraud_alert">("payment_reminder");
  const [callState, setCallState] = useState<"IDLE" | "RINGING" | "CONNECTED" | "ENDED">("IDLE");
  const [callDuration, setCallDuration] = useState(0);
  const [callLog, setCallLog] = useState<{ speaker: string; text: string; time: string }[]>([]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "👋 Hello! I am **PayPilot AI**, your autonomous PayPal financial agent.\n\nI automate your invoicing, monitor PayPal webhooks for instant settlement, and protect your cash flow with real-time fraud scoring.\n\n📞 **New Feature:** You can also trigger an **AI Voice Agent Call** to any phone number — available for **all users on Free and Pro plans**!",
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"invoices" | "fraud" | "voice">("invoices");

  const fetchData = async () => {
    try {
      const [invRes, fraudRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/fraud"),
      ]);
      const invData = await invRes.json();
      const fraudData = await fraudRes.json();
      if (invData.invoices) setInvoices(invData.invoices);
      if (fraudData.alerts) setFraudAlerts(fraudData.alerts);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Call timer simulation
  useEffect(() => {
    let timer: any;
    if (callState === "CONNECTED") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.reply || "Done!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      await fetchData();
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "system",
          text: "⚠️ Failed to reach PayPilot AI agent. Please check network connection.",
          timestamp: "Error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateInvoiceModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientEmail || !newAmount) return;
    setIsSubmittingInvoice(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_name: newClientName || newClientEmail.split("@")[0],
          recipient_email: newClientEmail,
          items: [
            {
              name: newItemDesc || "Consulting & Services",
              quantity: 1,
              unit_amount: { currency_code: "USD", value: parseFloat(newAmount).toFixed(2) },
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.invoice) {
        setShowCreateModal(false);
        setNewClientName("");
        setNewClientEmail("");
        setNewAmount("500.00");
        await fetchData();

        setMessages((prev) => [
          ...prev,
          {
            id: `inv-${Date.now()}`,
            sender: "system",
            text: `📄 **PayPal Invoice Created:** \`${data.invoice.invoice_number}\` sent to **${data.invoice.recipient_name}** for **$${data.invoice.amount.toFixed(2)} USD**!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const simulatePayPalPayment = async (invoiceId: string) => {
    try {
      await fetch("/api/paypal/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `WH-SIM-${Date.now()}`,
          event_type: "INVOICING.INVOICE.PAID",
          resource: {
            id: invoiceId,
            invoice_id: invoiceId,
          },
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `wh-${Date.now()}`,
          sender: "system",
          text: `🔔 **PayPal Webhook Received:** Invoice \`${invoiceId}\` marked as **PAID** in real time!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Initiate AI Phone Call (Works for FREE and PRO plan!)
  const initiatePhoneCall = async (phone: string, purpose: "payment_reminder" | "invoicing" | "fraud_alert") => {
    setShowCallModal(true);
    setCallState("RINGING");
    setCallLog([]);

    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          purpose,
          recipientName: selectedInvoice?.recipient_name || "Valued Client",
          invoiceNumber: selectedInvoice?.invoice_number || "INV-2026-002",
          amount: selectedInvoice?.amount || 1800.0,
          isProPlan: userPlan === "PRO",
        }),
      });
      const data = await res.json();

      // Simulate ring for 2 seconds then connect
      setTimeout(() => {
        setCallState("CONNECTED");
        setCallLog([
          {
            speaker: "PayPilot AI",
            text: data.initialVoiceGreeting || "Hello! PayPilot AI calling regarding your PayPal merchant account.",
            time: "00:01",
          },
        ]);

        // Add follow-up dialogue
        setTimeout(() => {
          setCallLog((prev) => [
            ...prev,
            {
              speaker: "Caller",
              text: "Yes, I received the email! Can you send me the one-click PayPal link by SMS?",
              time: "00:08",
            },
            {
              speaker: "PayPilot AI",
              text: "Done! A secure PayPal payment link has been dispatched to your mobile. Thank you for using PayPilot AI!",
              time: "00:14",
            },
          ]);
        }, 5000);
      }, 2500);
    } catch (e) {
      setCallState("ENDED");
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "HIGH_RISK") return matchesSearch && inv.risk_level === "HIGH";
    return matchesSearch && inv.status === statusFilter;
  });

  // Metrics
  const totalSettled = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalOutstanding = invoices
    .filter((i) => i.status === "SENT")
    .reduce((sum, i) => sum + i.amount, 0);

  const highRiskCount = fraudAlerts.filter((a) => a.severity === "HIGH").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">PayPilot AI</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PayPal AI Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Invoicing &bull; Real-Time Fraud Sentinel &bull; Universal Voice Agent</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Plan Badge (Free or Pro) */}
          <button
            onClick={() => setShowPricingModal(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              userPlan === "PRO"
                ? "bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span>Plan: {userPlan}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* AI Voice Call Button */}
          <button
            onClick={() => initiatePhoneCall(callPhoneNumber, "payment_reminder")}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>AI Voice Call (Free &amp; Pro)</span>
          </button>

          <a
            href="https://github.com/arshsri0513/paypilot-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Universal Voice Call Announcement Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 border-b border-emerald-500/20 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-emerald-300">
          <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Universal AI Voice Hotline:</strong> Dial <code className="bg-slate-950 px-2 py-0.5 rounded text-white font-mono">+1 (888) 729-7456</code> or trigger an automated call to any number &mdash; <strong>100% active on Free &amp; Pro plans without restriction!</strong>
          </span>
        </div>
        <button
          onClick={() => initiatePhoneCall(callPhoneNumber, "payment_reminder")}
          className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold whitespace-nowrap transition shadow-sm"
        >
          Try Voice Call Demo
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric Cards Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Settled Revenue</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-white">
                ${totalSettled.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-emerald-400 flex items-center mt-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Verified via PayPal APIs
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Receivables</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-white">
                ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-amber-400 flex items-center mt-1">
                {invoices.filter((i) => i.status === "SENT").length} active invoices awaiting payment
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Invoices</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-white">{invoices.length}</h2>
              <p className="text-xs text-slate-400 mt-1">PayPal REST API v2</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fraud Sentinel</span>
              <div
                className={`p-2 rounded-lg ${
                  highRiskCount > 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {highRiskCount > 0 ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white">{highRiskCount}</h2>
                <span className="text-xs text-slate-400">anomalies flagged</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time webhook inspection active</p>
            </div>
          </div>
        </section>

        {/* Two-Column Grid: Left (Tables/Alerts/Voice) & Right (AI Copilot Chat) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {/* Tab Navigation & Action Controls */}
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 ${
                      activeTab === "invoices"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Invoices ({invoices.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("fraud")}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 ${
                      activeTab === "fraud"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Fraud Sentinel ({fraudAlerts.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("voice")}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 ${
                      activeTab === "voice"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Voice Agent</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Invoice</span>
                  </button>

                  <button
                    onClick={fetchData}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Invoices Tab */}
              {activeTab === "invoices" && (
                <div>
                  {/* Search and Filters Bar */}
                  <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by client, email, or invoice #..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SENT">Sent / Unpaid</option>
                      <option value="PAID">Paid</option>
                      <option value="HIGH_RISK">High Risk Only</option>
                    </select>
                  </div>

                  <div className="divide-y divide-slate-800 overflow-x-auto">
                    {filteredInvoices.length === 0 ? (
                      <div className="p-12 text-center text-slate-500">
                        No matching invoices found.
                      </div>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition cursor-pointer"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{inv.recipient_name}</span>
                              <span className="text-xs text-slate-400">({inv.recipient_email})</span>
                              {inv.risk_level === "HIGH" && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> High Risk
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center space-x-3">
                              <span>#{inv.invoice_number}</span>
                              <span>&bull;</span>
                              <span>Due: {inv.due_date}</span>
                              <span>&bull;</span>
                              <span className="text-slate-300">
                                {inv.items[0]?.name || "Consulting"}
                              </span>
                            </div>
                          </div>

                          <div
                            className="flex items-center justify-between sm:justify-end space-x-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-right">
                              <div className="font-bold text-white text-base">
                                ${inv.amount.toFixed(2)}
                              </div>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                                  inv.status === "PAID"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>

                            {/* Voice Reminder Button */}
                            {inv.status === "SENT" && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  initiatePhoneCall("+1 (555) 782-9912", "payment_reminder");
                                }}
                                className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs transition"
                                title="Call client with AI Payment Reminder (Free for all users)"
                              >
                                <PhoneCall className="w-4 h-4" />
                              </button>
                            )}

                            {inv.status === "SENT" && (
                              <button
                                onClick={() => simulatePayPalPayment(inv.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center space-x-1 shadow-sm"
                                title="Simulate PayPal Webhook payment confirmation"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Simulate Paid</span>
                              </button>
                            )}

                            {inv.paypal_view_url && (
                              <a
                                href={inv.paypal_view_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition"
                                title="View PayPal Sandbox Invoice"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Fraud Tab */}
              {activeTab === "fraud" && (
                <div className="divide-y divide-slate-800">
                  {fraudAlerts.map((alert) => (
                    <div key={alert.id} className="p-5 hover:bg-slate-800/30 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              alert.severity === "HIGH"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {alert.severity} RISK ({alert.score}/100)
                          </span>
                          <span className="text-sm font-semibold text-white">{alert.title}</span>
                        </div>
                        <span className="text-xs text-slate-500">{alert.transaction_id}</span>
                      </div>

                      <p className="text-xs text-slate-300">{alert.description}</p>

                      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 text-xs space-y-1">
                        <span className="text-slate-400 font-medium">Risk Factors:</span>
                        <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                          {alert.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-blue-400 font-medium flex items-center">
                          <Zap className="w-3.5 h-3.5 mr-1" />
                          <span>Action: {alert.suggested_action}</span>
                        </div>
                        <button
                          onClick={() => initiatePhoneCall(callPhoneNumber, "fraud_alert")}
                          className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs flex items-center space-x-1 border border-rose-500/30"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Security Alert</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Voice Agent Tab */}
              {activeTab === "voice" && (
                <div className="p-6 space-y-6">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <PhoneCall className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-white text-base">PayPilot Autonomous Voice Dispatcher</h3>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        Free &amp; Pro: No Subscription Required
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Even if a customer or business owner does not purchase a Pro plan, PayPilot AI can dial any specified phone number to follow up on late invoices, provide instant voice billing, or broadcast urgent fraud alerts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                      <label className="text-xs font-semibold text-slate-300">Target Phone Number</label>
                      <input
                        type="tel"
                        value={callPhoneNumber}
                        onChange={(e) => setCallPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                      <label className="text-xs font-semibold text-slate-300">Call Objective</label>
                      <select
                        value={callPurpose}
                        onChange={(e: any) => setCallPurpose(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                      >
                        <option value="payment_reminder">Payment Due Follow-Up &amp; SMS Checkout</option>
                        <option value="invoicing">Voice Billing Assistant</option>
                        <option value="fraud_alert">High-Priority Fraud Sentinel Alert</option>
                      </select>

                      <button
                        onClick={() => initiatePhoneCall(callPhoneNumber, callPurpose)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Place Call Immediately</span>
                      </button>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incoming Voice Hotline</h4>
                      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                        <span className="text-xs text-slate-400">Toll-Free Merchant Agent:</span>
                        <div className="text-lg font-mono font-bold text-emerald-400">+1 (888) 729-7456</div>
                        <p className="text-[11px] text-slate-500">24/7 AI Voice Responder &bull; Available to all users</p>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                        <div className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Natural voice conversation via Speech-to-Text</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Direct SMS PayPal sandbox payment checkout</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Automatic CRM &amp; Webhook logging</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Webhook Simulator Bar */}
            <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900/50 border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Live PayPal Webhook Engine</h4>
                  <p className="text-xs text-slate-400">
                    Listening for <code className="text-blue-300">INVOICING.INVOICE.PAID</code> and{" "}
                    <code className="text-blue-300">PAYMENT.CAPTURE.COMPLETED</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  invoices.length > 0
                    ? simulatePayPalPayment(invoices[0].id)
                    : alert("Create an invoice first!")
                }
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition whitespace-nowrap"
              >
                Fire Test Webhook Event
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): AI Financial Copilot */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">PayPilot AI Agent</h3>
                  <p className="text-[11px] text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
                    Autonomous Mode Active
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">PayPal Tools V2</span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/40 overflow-x-auto flex space-x-2 text-xs scrollbar-none">
              <button
                onClick={() =>
                  handleSendMessage("Send an invoice to client@acme.com for $1,250 for website redesign")
                }
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition border border-slate-700 text-[11px]"
              >
                + Bill Acme $1,250
              </button>
              <button
                onClick={() => handleSendMessage("What is our total revenue collected via PayPal?")}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition border border-slate-700 text-[11px]"
              >
                📊 Cash Flow
              </button>
              <button
                onClick={() => handleSendMessage("Do we have any high risk fraud alerts?")}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition border border-slate-700 text-[11px]"
              >
                🛡️ Fraud Check
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : m.sender === "system"
                        ? "bg-amber-950/40 border border-amber-500/30 text-amber-200"
                        : "bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>
                    <div
                      className={`text-[10px] mt-1.5 ${
                        m.sender === "user" ? "text-blue-200" : "text-slate-500"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center space-x-2 text-xs text-blue-400 bg-slate-800/40 p-3 rounded-xl w-fit">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-200"></div>
                  <span>PayPilot AI is contacting PayPal APIs...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="e.g. Bill john@xyz.com $600 for consulting..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL 1: Create Invoice --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Create New PayPal Invoice</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceModalSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Client Name / Business</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Client Email Address *</label>
                <input
                  type="email"
                  required
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="e.g. billing@acme.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Service / Item Description</label>
                <input
                  type="text"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="e.g. Website development & SEO"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Total Amount (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvoice}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center space-x-1 shadow-md"
                >
                  {isSubmittingInvoice ? "Dispatching..." : "Send via PayPal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Interactive Voice Agent Call --- */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-500"></div>

            <button
              onClick={() => {
                setShowCallModal(false);
                setCallState("IDLE");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Avatar & Soundwaves */}
            <div className="pt-4 flex flex-col items-center">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition ${
                    callState === "CONNECTED"
                      ? "bg-emerald-600 text-white animate-pulse"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  <Bot className="w-10 h-10" />
                </div>
                {callState === "CONNECTED" && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  </span>
                )}
              </div>

              <h4 className="mt-4 font-bold text-white text-lg">PayPilot AI Voice Agent</h4>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {callPhoneNumber} &bull; {userPlan} Tier (No Pro Required)
              </p>
              <div className="text-xs text-slate-400 mt-1 font-semibold">
                {callState === "RINGING" && "Ringing client phone..."}
                {callState === "CONNECTED" && `Call in Progress (${callDuration}s)`}
                {callState === "ENDED" && "Call Ended"}
              </div>
            </div>

            {/* Live Call Transcript */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 h-48 overflow-y-auto text-left text-xs space-y-2.5">
              {callLog.length === 0 ? (
                <div className="text-slate-500 text-center pt-16 flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span>Connecting encrypted audio stream...</span>
                </div>
              ) : (
                callLog.map((c, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg ${
                      c.speaker === "PayPilot AI"
                        ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-200"
                        : "bg-slate-800/80 text-slate-200"
                    }`}
                  >
                    <div className="font-bold text-[10px] text-slate-400 mb-0.5">{c.speaker}</div>
                    <div>{c.text}</div>
                  </div>
                ))
              )}
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={() => {
                  setCallState("ENDED");
                  setTimeout(() => setShowCallModal(false), 800);
                }}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition"
                title="Hang up call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Pricing & Universal Call Guarantee --- */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg">PayPilot AI Membership Plans</h3>
                <p className="text-xs text-slate-400">Fair access for all small business owners</p>
              </div>
              <button onClick={() => setShowPricingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Free Plan */}
              <div
                className={`p-4 rounded-2xl border transition ${
                  userPlan === "FREE"
                    ? "border-emerald-500/60 bg-emerald-950/20"
                    : "border-slate-800 bg-slate-950/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Free Starter</span>
                  <span className="text-emerald-400 font-bold">$0/mo</span>
                </div>
                <p className="text-slate-400 mt-1">Everything needed for solo merchants.</p>

                <ul className="mt-4 space-y-2 text-slate-300">
                  <li className="flex items-center space-x-1.5 text-emerald-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Voice Phone Calls (Included!)</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PayPal Invoicing API v2</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-Time Webhook Listeners</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fraud &amp; Anomaly Sentinel</span>
                  </li>
                </ul>

                <button
                  onClick={() => {
                    setUserPlan("FREE");
                    setShowPricingModal(false);
                  }}
                  className="w-full mt-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                >
                  {userPlan === "FREE" ? "Current Plan" : "Switch to Free"}
                </button>
              </div>

              {/* Pro Plan */}
              <div
                className={`p-4 rounded-2xl border transition ${
                  userPlan === "PRO"
                    ? "border-purple-500/60 bg-purple-950/20"
                    : "border-slate-800 bg-slate-950/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Pro Merchant</span>
                  <span className="text-purple-400 font-bold">$29/mo</span>
                </div>
                <p className="text-slate-400 mt-1">Advanced multi-team accounting.</p>

                <ul className="mt-4 space-y-2 text-slate-300">
                  <li className="flex items-center space-x-1.5 text-emerald-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Voice Phone Calls (Unlimited)</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Custom Invoice Branding</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Multi-Seat Accountant Roles</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Priority Dispute Defense</span>
                  </li>
                </ul>

                <button
                  onClick={() => {
                    setUserPlan("PRO");
                    setShowPricingModal(false);
                  }}
                  className="w-full mt-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                >
                  {userPlan === "PRO" ? "Current Plan" : "Switch to Pro"}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              💡 <strong>Guarantee:</strong> We believe essential voice reminders and security alerts must never be locked behind a paywall. Even if you do not buy the Pro plan, calling any phone number remains 100% operational.
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Invoice Details Modal --- */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Invoice #{selectedInvoice.invoice_number}</h3>
                <p className="text-xs text-slate-400">{selectedInvoice.id}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold text-white">{selectedInvoice.recipient_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-300">{selectedInvoice.recipient_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">{selectedInvoice.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Due Date:</span>
                <span className="text-slate-300">{selectedInvoice.due_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-lg font-bold text-white">${selectedInvoice.amount.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap gap-2">
              {selectedInvoice.status === "SENT" && (
                <button
                  onClick={() => {
                    initiatePhoneCall("+1 (555) 782-9912", "payment_reminder");
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Client (Free &amp; Pro)</span>
                </button>
              )}

              {selectedInvoice.status === "SENT" && (
                <button
                  onClick={() => {
                    simulatePayPalPayment(selectedInvoice.id);
                    setSelectedInvoice((prev) => (prev ? { ...prev, status: "PAID" } : null));
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Paid</span>
                </button>
              )}

              {selectedInvoice.paypal_view_url && (
                <a
                  href={selectedInvoice.paypal_view_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1 border border-slate-700"
                >
                  <span>Open in PayPal Sandbox</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-6 text-center text-xs text-slate-500 space-y-2">
        <p>
          PayPilot AI &bull; Built with PayPal Developer Platform &amp; Agentic AI for the PayPal AI Hackathon
        </p>
        <p>
          Created by{" "}
          <a
            href="https://github.com/arshsri0513"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            @arshsri0513
          </a>
        </p>
      </footer>
    </div>
  );
}
