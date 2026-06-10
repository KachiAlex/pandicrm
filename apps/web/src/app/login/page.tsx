"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Mail, Lock, Eye, EyeOff, User, Building2, Phone, Briefcase, X } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

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
          {error && !showRegister && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Signing in..." : "Sign in"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="font-medium text-pk-600 hover:text-pk-700 transition-colors"
              >
                Create account
              </button>
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

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, company, email, phone, role, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created but sign-in failed. Please log in manually.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Create your account</h2>
            <p className="text-xs text-gray-400">Get started with pandicrm for free</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Last name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Company
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors appearance-none bg-white"
                >
                  <option value="">Select role</option>
                  <option value="sales_rep">Sales Rep</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="account_manager">Account Manager</option>
                  <option value="customer_success">Customer Success</option>
                  <option value="admin">Admin</option>
                  <option value="founder">Founder / CEO</option>
                  <option value="other">Other</option>
                </select>
              </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
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

          <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Create account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
