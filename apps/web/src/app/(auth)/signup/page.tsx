import Link from "next/link";

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
            <form className="space-y-6">
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
                  className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="Pandi Labs"
                />
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
                    defaultValue=""
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
                    defaultValue=""
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
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                  placeholder="Create a strong password"
                />
                <p className="text-xs text-muted">
                  Minimum 8 characters with numbers or symbols.
                </p>
              </div>
              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-[0_32px_80px_-35px_rgba(91,75,255,0.65)] transition hover:shadow-[0_36px_90px_-30px_rgba(91,75,255,0.6)]"
                >
                  Launch trial
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
            <p className="mt-6 text-sm text-muted">
              Already have an account?{" "}
              <Link
                href="/signin"
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
