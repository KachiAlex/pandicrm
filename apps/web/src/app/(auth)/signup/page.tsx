"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";

const APP_HOME_PATH = "/crm";

const plans = [
  {
    title: "Fast team setup",
    description:
      "Launch a clean CRM workspace with onboarding defaults your team can use immediately.",
    features: [
      "Contacts, deals, and tasks in one workspace",
      "AI-powered notes and task handoffs",
      "Guided onboarding after account creation",
    ],
  },
  {
    title: "Clear next steps",
    description:
      "Every field has a purpose so new users understand what happens before they click submit.",
    features: [
      "No credit card required",
      "Password guidance before submission",
      "A direct path into the CRM after signup",
    ],
  },
];

const launchChecklist = [
  "Takes about 60 seconds",
  "No credit card required",
  "You can invite your team after setup",
];

function getFriendlyError(message: string): string {
  if (/Unable to reach the API/i.test(message)) {
    return "Signup service is unavailable right now. Set NEXT_PUBLIC_API_URL to your deployed API base URL.";
  }

  return message;
}

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
      setError(getFriendlyError(err instanceof Error ? err.message : "Failed to create your account"));
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

  const passwordChecks = [
    {
      label: "At least 6 characters",
      met: password.length >= 6,
    },
    {
      label: "Passwords match",
      met: !!confirmPassword && password === confirmPassword,
    },
  ];

  return (
    <div className="relative flex min-h-[100svh] flex-col bg-surface text-base-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_25%_20%,_rgba(0,212,255,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-10rem] h-[26rem] bg-[radial-gradient(circle_at_80%_80%,_rgba(255,127,211,0.2),transparent_65%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12 sm:px-12">
        <div className="grid gap-8 rounded-[32px] border border-border/50 bg-white/85 p-6 shadow-[0_36px_90px_-45px_rgba(10,11,40,0.6)] backdrop-blur sm:p-10 lg:grid-cols-2">
          <div className="rounded-[28px] border border-border/60 bg-white/92 p-6 shadow-[0_28px_80px_-40px_rgba(9,11,42,0.6)] sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-base-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Start building
            </span>
            <div className="mt-5 space-y-4">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                Create your Pandi workspace.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted">
                Set up your account first. We will guide your team, company details, and workspace preferences after signup.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted">
              {launchChecklist.map((item) => (
                <span key={item} className="rounded-full border border-border/60 bg-base-50 px-4 py-2">
                  {item}
                </span>
              ))}
            </div>

            {error && (
              <div aria-live="polite" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-[24px] border border-border/60 bg-base-50/70 p-5">
                <div className="mb-4 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">About you</p>
                  <p className="text-sm text-muted">Use the name and work email you want attached to the workspace owner account.</p>
                </div>
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
                <div className="mt-6 space-y-2">
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
              </div>

              <div className="rounded-[24px] border border-border/60 bg-base-50/70 p-5">
                <div className="mb-4 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Workspace setup</p>
                  <p className="text-sm text-muted">These fields are optional, but they make the first-run experience more tailored.</p>
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
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
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
              </div>

              <div className="rounded-[24px] border border-border/60 bg-base-50/70 p-5">
                <div className="mb-4 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Security</p>
                  <p className="text-sm text-muted">Create the password for the workspace owner account.</p>
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
                </div>
                <div className="mt-6 space-y-2">
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

                <ul className="mt-4 space-y-2 text-xs text-muted">
                  {passwordChecks.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${item.met ? "bg-primary" : "bg-border"}`} />
                      <span className={item.met ? "text-base-900" : undefined}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 pt-1">
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
                  {isLoading ? "Creating workspace..." : "Create workspace"}
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
            <p className="mt-5 text-xs text-muted">
              {company || role || teamSize
                ? "Your optional onboarding details are saved so the workspace can open with a more tailored setup."
                : "You can skip company, role, and team size for now and finish them after signup."}
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

          <div className="flex flex-col gap-6">
            <div className="rounded-[28px] border border-border/40 bg-gradient-to-br from-base-900 via-base-800 to-base-950 p-8 text-white shadow-[0_26px_85px_-40px_rgba(8,10,45,0.8)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">What happens next</p>
              <h2 className="mt-3 font-display text-3xl leading-tight">
                Create the owner account first, then configure the workspace with context.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/75">
                The signup form is now focused on the minimum information needed to provision access cleanly. Team and workflow preferences can be tuned immediately after entry.
              </p>

              <div className="mt-8 grid gap-4 text-sm text-white/75">
                {plans.map(({ title, description, features }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">01</span>
                      <p className="font-display text-lg text-white">{title}</p>
                    </div>
                    <p className="mt-3 leading-relaxed text-white/70">{description}</p>
                    <ul className="mt-4 space-y-2 text-xs text-white/65">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-white/85 p-5 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Clarity</p>
                <p className="mt-3 text-sm leading-relaxed text-base-900">
                  Required account fields are grouped separately from optional onboarding fields so the signup decision is easier to scan.
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-white/85 p-5 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Support</p>
                <p className="mt-3 text-sm leading-relaxed text-base-900">
                  If signup still fails after deployment, connect the frontend to the API with NEXT_PUBLIC_API_URL so requests stop pointing at localhost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
