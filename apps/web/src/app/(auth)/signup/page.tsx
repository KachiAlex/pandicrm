"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";

const APP_HOME_PATH = "/crm";

const plans = [
  {
    title: "Growth",
    description:
      "For GTM teams aligning rituals across sales, marketing, and success.",
    features: [
      "Unlimited ritual boards",
      "AI-powered notes & task handoffs",
      "Pipeline health scoring",
    ],
  },
  {
    title: "Scale",
    description:
      "For operators running multi-product motions with governance built in.",
    features: [
      "Advanced playbooks",
      "SAML SSO + SCIM",
      "Custom data sync windows",
    ],
  },
];

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectPath, setRedirectPath] = useState(APP_HOME_PATH);

  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, register } = useAuth();
  const signinHref = redirectPath === APP_HOME_PATH
    ? "/signin"
    : `/signin?next=${encodeURIComponent(redirectPath)}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");

    if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
      setRedirectPath(nextParam);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthLoading, isAuthenticated, redirectPath, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (!normalizedEmail) {
      setError("A valid work email is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("You need to accept the terms to continue");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register({
        email: { value: normalizedEmail },
        name: fullName,
        password,
        role: "user",
      });
      router.replace(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create your account");
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    isLoading ||
    isAuthLoading ||
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword ||
    !acceptTerms;

  return (
    <div className="relative flex min-h-[100svh] flex-col bg-surface text-base-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_25%_20%,_rgba(0,212,255,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-10rem] h-[26rem] bg-[radial-gradient(circle_at_80%_80%,_rgba(255,127,211,0.2),transparent_65%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12 sm:px-12">
        <div className="grid gap-12 rounded-[32px] border border-border/50 bg-white/85 p-10 shadow-[0_36px_90px_-45px_rgba(10,11,40,0.6)] backdrop-blur lg:grid-cols-[420px_minmax(0,_1fr)]">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Start building
            </span>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                Create your Pandi workspace.
              </h1>
              <p className="text-base leading-relaxed text-muted">
                Launch rituals, automate AI summaries, and orchestrate follow-ups across every revenue motion in days, not months.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-muted">
              {plans.map(({ title, description, features }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-border/60 bg-white/80 p-5 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-base-900">{title}</p>
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-white shadow-[0_16px_30px_-18px_rgba(91,75,255,0.65)]">
                      •
                    </span>
                  </div>
                  <p className="mt-3 leading-relaxed">{description}</p>
                  <ul className="mt-4 space-y-2 text-xs text-muted">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-1 size-2 rounded-full bg-secondary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-border/60 bg-white/90 p-8 shadow-[0_28px_80px_-40px_rgba(9,11,42,0.6)]">
            {error && (
              <div aria-live="polite" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      if (error) setError("");
                    }}
                    className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                    placeholder="Jordan"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      if (error) setError("");
                    }}
                    className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                    placeholder="Hayes"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  inputMode="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="company"
                  className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                >
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="Pandi Labs"
                />
                <p className="text-xs text-muted">Used only to personalize onboarding after your workspace is created.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="role"
                    className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full appearance-none rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="" disabled>
                      Choose your role
                    </option>
                    <option value="revops">Revenue Operations</option>
                    <option value="sales">Sales Leadership</option>
                    <option value="cs">Customer Success</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="teamSize"
                    className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                  >
                    Team size
                  </label>
                  <select
                    id="teamSize"
                    name="teamSize"
                    className="w-full appearance-none rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                    value={teamSize}
                    onChange={(event) => setTeamSize(event.target.value)}
                  >
                    <option value="" disabled>
                      Select size
                    </option>
                    <option value="1-10">1 – 10</option>
                    <option value="11-50">11 – 50</option>
                    <option value="51-200">51 – 200</option>
                    <option value="201-500">201 – 500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-medium text-primary transition hover:text-secondary"
                >
                  {showPassword ? "Hide password" : "Show password"}
                </button>
                <p className="text-xs text-muted">
                  Minimum 6 characters. Longer passphrases are strongly recommended.
                </p>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold uppercase tracking-[0.24em] text-muted"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-xs font-medium text-primary transition hover:text-secondary"
                >
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </button>
              </div>
              <div className="space-y-4 pt-2">
                <label className="inline-flex items-start gap-3 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(event) => setAcceptTerms(event.target.checked)}
                    className="mt-0.5 size-4 rounded border border-border/70 bg-white text-primary focus:ring-primary/30"
                  />
                  <span>I agree to the Terms of Service and Privacy Policy.</span>
                </label>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-[0_32px_80px_-35px_rgba(91,75,255,0.65)] transition hover:shadow-[0_36px_90px_-30px_rgba(91,75,255,0.6)]"
                >
                  {isLoading ? "Creating workspace..." : "Launch trial"}
                </button>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>By continuing you agree to the</span>
                  <Link
                    href="/terms"
                    className="text-primary transition hover:text-secondary"
                  >
                    Terms of Service
                  </Link>
                  <span>and</span>
                  <Link
                    href="/privacy"
                    className="text-primary transition hover:text-secondary"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </form>
            <p className="mt-4 text-xs text-muted">
              {company || role || teamSize
                ? "Your onboarding details are captured for a tailored workspace setup after account creation."
                : "Add company, role, and team size to personalize onboarding after account creation."}
            </p>
            <p className="mt-6 text-sm text-muted">
              Already have an account?{" "}
              <Link
                href={signinHref}
                className="font-medium text-primary transition hover:text-secondary"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
