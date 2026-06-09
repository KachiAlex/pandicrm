"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg,#0d0d12 0%,#180814 100%)" }}
    >
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          top: -100,
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle,rgba(255,26,151,0.22) 0%,transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#ff1a97,#b80055)",
                boxShadow: "0 4px 14px rgba(184,0,85,0.35)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M7 12.5C7 12.5 1.5 8.833 1.5 5A3.5 3.5 0 0 1 7 2.917 3.5 3.5 0 0 1 12.5 5C12.5 8.833 7 12.5 7 12.5Z" fill="white" />
              </svg>
            </div>
            <span className="font-black text-white text-lg tracking-tight">pandicrm</span>
          </div>
          <h1 className="font-bold text-white text-xl tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Sign in to your workspace</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/dashboard";
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-pk-600 focus:ring-pk-500" />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>
              <a href="#" className="text-xs font-medium text-pk-600 hover:text-pk-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-p w-full justify-center py-3 text-sm">
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Don&apos;t have an account?{" "}
              <a href="#" className="font-medium text-pk-600 hover:text-pk-700 transition-colors">
                Join the waitlist
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ff66b3")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
          >
            &larr; Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
