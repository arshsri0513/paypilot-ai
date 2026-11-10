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
} from "lucide-react";
import { Invoice, FraudAlert, ChatMessage } from "@/lib/types";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "👋 Hello! I am **PayPilot AI**, your autonomous PayPal financial agent.\n\nI can help you generate invoices in seconds, track payment settlements, and protect your cash flow from fraudulent transactions.\n\nTry asking: *\"Send an invoice to client@acme.com for $1,250 for web redesign\"*",
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"invoices" | "fraud">("invoices");

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
      // Refresh invoice list and fraud alerts
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
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">PayPilot AI</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PayPal AI Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Invoicing & Real-Time Fraud Sentinel</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PayPal Sandbox Live</span>
          </div>

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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric Cards Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
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

          {/* Card 2 */}
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

          {/* Card 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Invoices</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-white">{invoices.length}</h2>
              <p className="text-xs text-slate-400 mt-1">Managed autonomously</p>
            </div>
          </div>

          {/* Card 4 */}
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
                <span className="text-xs text-slate-400">high-risk alerts</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time webhook inspection active</p>
            </div>
          </div>
        </section>

        {/* Two-Column Grid: Left (Tables/Alerts) & Right (AI Copilot Chat) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* View Switcher Tabs */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                      activeTab === "invoices"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>PayPal Invoices ({invoices.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("fraud")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                      activeTab === "fraud"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Fraud & Risk Feed ({fraudAlerts.length})</span>
                  </button>
                </div>

                <button
                  onClick={fetchData}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Tab 1: Invoices Table */}
              {activeTab === "invoices" && (
                <div className="divide-y divide-slate-800 overflow-x-auto">
                  {invoices.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      No invoices found. Ask the AI co-pilot on the right to create one!
                    </div>
                  ) : (
                    invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition"
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
                            <span>•</span>
                            <span>Due: {inv.due_date}</span>
                            <span>•</span>
                            <span className="text-slate-300">
                              {inv.items[0]?.name || "Consulting"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-3">
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
              )}

              {/* Tab 2: Fraud Alerts */}
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

                      <div className="text-xs text-blue-400 font-medium flex items-center pt-1">
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        <span>Recommended action: {alert.suggested_action}</span>
                      </div>
                    </div>
                  ))}
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
                  <h4 className="text-sm font-semibold text-white">Live PayPal Webhook Integration</h4>
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
                + Bill Acme Corp $1,250
              </button>
              <button
                onClick={() => handleSendMessage("What is our total revenue collected via PayPal?")}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition border border-slate-700 text-[11px]"
              >
                📊 Cash Flow Overview
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
