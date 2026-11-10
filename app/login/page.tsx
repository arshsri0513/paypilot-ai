"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Check, Lock, Mail, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("Pro");
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      // Store user session in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "paypilot_user",
          JSON.stringify({
            name: name || (email ? email.split("@")[0] : "Merchant User"),
            email: email || "merchant@example.com",
            plan: plan.toUpperCase(),
            provider: "email",
          })
        );
      }
      setTimeout(() => {
        router.push("/");
      }, 800);
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "paypilot_user",
          JSON.stringify({
            name: "Arsh Srivastava",
            email: "arshsri0513@gmail.com",
            plan: plan.toUpperCase(),
            provider: "google",
            avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          })
        );
      }
      setTimeout(() => {
        router.push("/");
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-[440px] bg-[#0c1424]/90 backdrop-blur-xl border border-slate-800/90 rounded-[28px] p-8 sm:p-9 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Top cyan neon border glow line */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"></div>

        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">PayPilot AI</h2>
            <p className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
              {isSignUp ? "WORKSPACE REGISTRATION" : "WORKSPACE LOGIN"}
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            {isSignUp
              ? "Start managing invoices and stopping fraud with autonomous AI."
              : "Sign in to your PayPilot merchant account."}
          </p>
        </div>

        {/* Google Direct Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl flex items-center justify-center space-x-3 text-xs sm:text-sm font-semibold text-slate-200 transition shadow-sm"
        >
          {/* Official Google G Logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#0c1424] px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 absolute">
            Or with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[#121c2e] border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#121c2e] border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#121c2e] border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Plan
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Voice Calls Included on Both!
              </span>
            </div>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full bg-[#121c2e] border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="Pro">Pro ($29/mo)</option>
              <option value="Free">Free Starter ($0/mo)</option>
              <option value="Enterprise">Enterprise Custom</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : authSuccess ? (
                <span className="flex items-center space-x-1">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Success!</span>
                </span>
              ) : (
                <span>{isSignUp ? "Create Account" : "Login"}</span>
              )}
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition text-center shadow-md"
            >
              Back
            </Link>
          </div>
        </form>

        {/* Toggle between Login and Create Account */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
