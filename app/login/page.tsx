"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Check, UserPlus, LogIn, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  const [isSignUp, setIsSignUp] = useState(modeParam === "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("Pro");
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    if (modeParam === "signup") {
      setIsSignUp(true);
    }
  }, [modeParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
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
      }, 700);
    }, 900);
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
      }, 700);
    }, 1100);
  };

  return (
    <div className="relative w-full max-w-[460px] bg-[#0c1424]/95 backdrop-blur-xl border border-slate-800/90 rounded-[28px] p-7 sm:p-9 shadow-2xl shadow-black/80 overflow-hidden">
      {/* Top cyan neon border glow line */}
      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"></div>

      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">PayPilot AI</h2>
          <p className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
            WORKSPACE AUTHENTICATION
          </p>
        </div>
      </div>

      {/* Prominent Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
            !isSignUp
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(true)}
          className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
            isSignUp
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Headline */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isSignUp
            ? "Join PayPilot AI to automate invoicing, fraud detection & voice alerts."
            : "Sign in to access your PayPal autonomous merchant dashboard."}
        </p>
      </div>

      {/* Google Direct Login Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-[#121c2e] hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl flex items-center justify-center space-x-3 text-xs sm:text-sm font-semibold text-slate-200 transition shadow-sm mb-4"
      >
        {/* Official Google G Logo */}
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
        <span>
          {isSignUp ? "Direct Sign Up with Google" : "Direct Sign In with Google"}
        </span>
      </button>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="border-t border-slate-800 w-full"></div>
        <span className="bg-[#0c1424] px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 absolute">
          Or with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {isSignUp && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-[#121c2e] border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-[#121c2e] border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full bg-[#121c2e] border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Plan
            </label>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Universal Voice Calls on Both!
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
        <div className="pt-2 flex items-center space-x-2.5">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : authSuccess ? (
              <span className="flex items-center space-x-1">
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Success!</span>
              </span>
            ) : isSignUp ? (
              <span className="flex items-center space-x-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition border border-slate-700 text-xs whitespace-nowrap"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>

          <Link
            href="/"
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition text-center shadow-md text-xs"
          >
            Back
          </Link>
        </div>
      </form>

      {/* Footer reassurance */}
      <div className="mt-5 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span>Secured with PayPal OAuth &amp; HMAC 256 Encryption</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <Suspense fallback={<div className="text-slate-400 text-xs">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
