import Link from "next/link";

const benefits = [
  "Summaries automatically routed to Slack and email",
  "Ritual boards tuned to daily, weekly, and monthly cadences",
  "Calendar-aware nudges so follow-ups never fade",
];

export default function SignInPage() {
  return (
    <div className="relative flex min-h-[100svh] flex-col bg-base-50 text-base-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(91,75,255,0.25),transparent_65%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12 sm:px-12">
        <div className="grid gap-12 rounded-[32px] border border-border/50 bg-white/80 p-10 shadow-[0_32px_80px_-40px_rgba(10,11,40,0.55)] backdrop-blur lg:grid-cols-[minmax(0,_1fr)_420px]">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                Welcome back
              </span>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                Sign in to orchestrate your revenue rituals.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted">
                Continue where you left off with AI summaries, synchronized tasks, and deal health that updates in real time.
              </p>
            </div>
            <div className="rounded-[28px] border border-border/60 bg-white/80 p-8 shadow-[0_24px_80px_-45px_rgba(11,13,40,0.6)]">
              <form className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium uppercase tracking-[0.22em] text-muted"
                  >
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-base text-base-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                    placeholder="you@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium uppercase tracking-[0.22em] text-muted">
                    <label htmlFor="password">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-primary transition hover:text-secondary"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-base text-base-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-muted">
                    <input
                      type="checkbox"
                      className="size-5 rounded border border-border/70 bg-white/70 text-primary focus:ring-primary/30"
                    />
                    Keep me signed in
                  </label>
                  <span className="text-xs text-muted">
                    Secure SSO available for enterprise teams
                  </span>
                </div>
                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-base-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-base-800"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-white shadow-[0_18px_32px_-18px_rgba(91,75,255,0.65)]">
                    →
                  </span>
                  Enter workspace
                </button>
              </form>
              <p className="mt-6 text-sm text-muted">
                Don’t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary transition hover:text-secondary"
                >
                  Start your 14-day trial
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-10 rounded-[28px] border border-border/40 bg-gradient-to-br from-base-900 via-base-800 to-base-950 p-8 text-white shadow-[0_26px_85px_-40px_rgba(8,10,45,0.8)]">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Why leaders choose Pandi
                </p>
                <h2 className="font-display text-2xl leading-snug">
                  Every note, ritual, and pipeline movement in one living system.
                </h2>
              </div>
              <ul className="space-y-4 text-sm text-white/70">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 size-2 rounded-full bg-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Security first</p>
              <p className="text-sm text-white/75">
                SOC 2 Type II certified. SAML SSO, domain capture, and automatic deprovisioning on every plan.
              </p>
              <p className="text-xs text-white/50">
                Need help? Email
                {" "}
                <a href="mailto:support@pandicrm.com" className="underline">
                  support@pandicrm.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
