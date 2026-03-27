"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  AtSign,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  FileText,
  Globe,
  MessageCircle,
  Quote,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
const featureCards = [
  {
    title: "Smart CRM",
    description: "Manage your customer relationships with AI insights and automation.",
    icon: Users,
    gradient: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
  },
  {
    title: "AI Note-Taking",
    description: "Capture ideas instantly with intelligent organization and summaries.",
    icon: Brain,
    gradient: "linear-gradient(135deg, var(--accent-secondary), var(--accent-tertiary))",
  },
  {
    title: "Task Management",
    description: "Stay on top of your work with intuitive task tracking and automation.",
    icon: CheckCircle2,
    gradient: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
  },
  {
    title: "Analytics Dashboard",
    description: "Gain insights with beautiful visualizations and real-time reports.",
    icon: BarChart3,
    gradient: "linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))",
  },
  {
    title: "Project Timeline",
    description: "Visualize your projects and deadlines with interactive timelines.",
    icon: Calendar,
    gradient: "linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))",
  },
  {
    title: "Automation",
    description: "Automate repetitive tasks and focus on what matters most.",
    icon: Zap,
    gradient: "linear-gradient(135deg, var(--accent-tertiary), var(--accent-secondary))",
  },
];

const dashboardStats = [
  { label: "Active Clients", value: "1,234", change: "+12%" },
  { label: "Notes Created", value: "5,678", change: "+8%" },
  { label: "Tasks Done", value: "890", change: "+23%" },
  { label: "Productivity", value: "94%", change: "+5%" },
];

const recentActivity = [
  { title: "Client meeting notes updated", time: "2 minutes ago" },
  { title: "New task assigned to Marketing Team", time: "15 minutes ago" },
  { title: "Project milestone completed", time: "1 hour ago" },
  { title: "AI summary generated for Q1 report", time: "2 hours ago" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart",
    rating: 5,
    content:
      "We replaced three disconnected tools in one week and reduced missed follow-ups by 37%. The pipeline clarity alone paid for itself.",
    result: "37% fewer missed follow-ups",
    initials: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    rating: 5,
    content:
      "The meeting-note workflow is excellent. Action items now become tasks automatically, and weekly execution reviews take half the time.",
    result: "2x faster weekly planning",
    initials: "MC",
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Designer",
    rating: 4,
    content:
      "I finally have one place for clients, notes, and tasks. It keeps me focused and gives me a professional process for every project.",
    result: "11 hours saved per week",
    initials: "ER",
  },
];

const heroStats = [
  { label: "Active Users", value: "50K+" },
  { label: "Tasks Completed", value: "1M+" },
  { label: "Uptime", value: "99.9%" },
];

const ctaHighlights = [
  "No credit card required",
  "14 day free trial",
  "Cancel anytime",
];

const workflowSteps = [
  {
    step: "01",
    title: "Capture",
    description: "Import contacts, opportunities, and notes from your current tools in minutes.",
  },
  {
    step: "02",
    title: "Orchestrate",
    description: "Convert conversations into tasks and rituals so execution happens automatically.",
  },
  {
    step: "03",
    title: "Scale",
    description: "Track progress, close faster, and keep the whole team aligned around outcomes.",
  },
];

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Globe },
  { label: "X", href: "https://x.com", icon: AtSign },
  { label: "Instagram", href: "https://www.instagram.com", icon: MessageCircle },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-purple-50/60 to-white text-base-900">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-16 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          style={{ background: "radial-gradient(circle, rgba(147,51,234,0.55), transparent 70%)" }}
          animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.55), transparent 70%)" }}
          animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-12 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.55), transparent 70%)" }}
          animate={{ x: [0, 60, 0], y: [0, -60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/50 bg-white/80 backdrop-blur px-6 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_18px_45px_-20px_rgba(147,51,234,0.65)]">
              <Sparkles style={{ width: "1.25rem", height: "1.25rem" }} />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">PandiCRM</span>
              <p className="font-display text-lg font-semibold">Intelligent Revenue Rituals</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-base-600">
            <a className="transition-colors hover:text-base-900" href="#features">
              Features
            </a>
            <a className="transition-colors hover:text-base-900" href="#dashboard">
              Dashboard
            </a>
            <a className="transition-colors hover:text-base-900" href="#testimonials">
              Testimonials
            </a>
            <a className="transition-colors hover:text-base-900" href="#how-it-works">
              How It Works
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <a
              className="rounded-full border border-border px-5 py-2.5 text-base-600 transition hover:border-primary hover:text-base-900 hover:shadow-[0_12px_32px_-18px_rgba(147,51,234,0.35)]"
              href="/signin"
            >
              Sign In
            </a>
            <a
              className="rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary px-5 py-2.5 text-white shadow-[0_16px_35px_-18px_rgba(147,51,234,0.65)] transition hover:shadow-[0_24px_45px_-22px_rgba(147,51,234,0.6)]"
              href="/signup"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col">
        <section className="mx-auto w-full max-w-7xl px-6 pb-32 pt-16">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-primary/25 bg-white/85 p-8 shadow-[0_42px_95px_-56px_rgba(76,29,149,0.55)] sm:p-12">
            <div
              className="absolute inset-0 bg-center opacity-35"
              style={{ backgroundImage: "url('/hero-grid.svg')", backgroundSize: "cover" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/70 to-secondary/12" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/80 px-5 py-2 text-xs font-medium text-primary shadow-[0_12px_32px_-18px_rgba(76,29,149,0.35)] backdrop-blur"
            >
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Workspace
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 font-display text-5xl leading-tight text-base-900 sm:text-6xl"
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                Turn Follow-Ups Into Revenue Rituals
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-base-600 lg:mx-0"
            >
              PandiCRM brings CRM, notes, tasks, and rituals together so your team follows through faster and grows
              predictable revenue.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:mx-0 lg:justify-start"
            >
              <a
                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-4 text-lg font-semibold text-white shadow-2xl transition hover:shadow-3xl hover:-translate-y-0.5"
                href="/signup"
              >
                Start Free - No Card Needed
                <ArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  style={{ width: "1.25rem", height: "1.25rem" }}
                />
              </a>
              <a
                className="inline-flex items-center gap-3 rounded-full border-2 border-border bg-white/80 px-8 py-4 text-lg font-semibold text-base-900 shadow-lg transition hover:border-primary hover:bg-white hover:-translate-y-0.5"
                href="/signup"
              >
                Book a Live Demo
              </a>
            </motion.div>

            <p className="mt-4 text-sm font-medium text-base-600">Trusted by 50,000+ revenue teams</p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-14 grid grid-cols-3 gap-4"
            >
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-primary/20 bg-white/82 p-5 text-center shadow-lg backdrop-blur"
                >
                  <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-2xl font-display font-semibold text-transparent sm:text-3xl">
                    {stat.value}
                  </div>
                  <p className="mt-1 text-sm text-base-600 sm:text-base">{stat.label}</p>
                </div>
              ))}
            </motion.div>

              </div>

              <motion.div
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-3xl border border-primary/20 bg-white/90 p-6 shadow-[0_28px_70px_-40px_rgba(76,29,149,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Pipeline Snapshot</p>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Live</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {dashboardStats.map((item) => (
                    <div key={item.label} className="rounded-xl border border-border/30 bg-base-50 p-3">
                      <p className="text-xs text-base-500">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-base-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-border/30 bg-white p-4">
                  <p className="text-sm font-semibold text-base-900">Team Activity</p>
                  <div className="mt-3 space-y-3">
                    {recentActivity.slice(0, 3).map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm text-base-800">{item.title}</p>
                          <p className="text-xs text-base-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-base-50 py-24">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                How It Works
              </span>
              <h2 className="mt-6 font-display text-4xl font-bold text-base-900">A Simple 3-Step Growth Workflow</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-base-600">
                Onboard your team quickly, standardize execution, and scale performance with repeatable rituals.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {workflowSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-3xl border border-border/30 bg-white p-7 shadow-[0_24px_55px_-40px_rgba(12,14,40,0.45)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary font-display text-sm font-semibold text-white">
                    {item.step}
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-base-900">{item.title}</h3>
                  <p className="mt-3 text-base-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-24">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                Platform Features
              </span>
              <h2 className="mt-6 font-display text-4xl font-bold text-base-900">
                Everything You Need to Succeed
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-base-600">
                Powerful tools designed to help you work smarter, not harder.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-border/30 bg-white p-8 shadow-xl transition hover:-translate-y-2 hover:shadow-2xl"
                  style={{ backgroundImage: "linear-gradient(180deg, rgba(147,51,234,0.05), rgba(236,72,153,0.08))" }}
                >
                  <div
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: feature.gradient }}
                  >
                    <feature.icon style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-base-900">{feature.title}</h3>
                  <p className="mt-3 text-base-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="dashboard" className="bg-base-50 py-24">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                Productivity Dashboard
              </span>
              <h2 className="mt-6 font-display text-4xl font-bold text-base-900">
                Track Your Progress at a Glance
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-base-600">
                Get real-time insights into your productivity and business growth.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-border/30 bg-white p-6 shadow-[0_24px_52px_-38px_rgba(12,14,40,0.45)] transition hover:shadow-[0_28px_62px_-40px_rgba(12,14,40,0.5)]"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }}
                    >
                      <TrendingUp style={{ width: "1.25rem", height: "1.25rem", color: "white" }} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                  </div>
                  <p className="mt-8 text-sm text-base-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 rounded-3xl border border-border/30 bg-white p-8 shadow-[0_35px_80px_-54px_rgba(12,14,40,0.55)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-base-900">Recent Activity</h3>
                  <p className="text-sm text-base-500">Stay on top of your team's progress.</p>
                </div>
                <a
                  href="/signin"
                  className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
                >
                  View All
                </a>
              </div>

              <div className="mt-8 space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-2xl border border-border/20 bg-white/80 px-4 py-4 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                      <FileText style={{ width: "1.25rem", height: "1.25rem" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base-900">{item.title}</p>
                      <p className="text-sm text-base-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="bg-white py-24">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                Testimonials
              </span>
              <h2 className="mt-6 font-display text-4xl font-bold text-base-900">
                Loved by Teams Worldwide
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-base-600">
                See what our users have to say about their experience.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-3xl border border-border/30 bg-gradient-to-b from-white via-purple-50 to-white p-8 shadow-xl transition hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="flex items-center gap-2 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        fill={index < testimonial.rating ? "currentColor" : "none"}
                        strokeWidth={index < testimonial.rating ? 0 : 1.8}
                        style={{ width: "1rem", height: "1rem" }}
                      />
                    ))}
                  </div>
                  <Quote className="mt-6" style={{ width: "2rem", height: "2rem", color: "var(--accent-primary)" }} />
                  <p className="mt-4 text-base-700">“{testimonial.content}”</p>
                  <p className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {testimonial.result}
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-base-900">{testimonial.name}</p>
                      <p className="text-sm text-base-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary py-24">
          <div className="absolute inset-0">
            <motion.div
              className="absolute -left-12 top-10 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              className="absolute -right-12 bottom-16 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(255,255,255,0.18)" }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
              Start Your Free Trial Today
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold">Ready to Transform Your Workflow?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
              Join thousands of teams who are already working smarter with our AI-powered platform. No credit card required.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primary shadow-2xl transition hover:shadow-3xl hover:-translate-y-0.5"
                href="/signup"
              >
                Get Started Free
                <ArrowRight className="transition-transform group-hover:translate-x-1" style={{ width: "1.25rem", height: "1.25rem" }} />
              </a>
              <a
                className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
                href="/signup"
              >
                Schedule a Demo
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
              {ctaHighlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 style={{ width: "1.1rem", height: "1.1rem" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/30 bg-base-900 py-12 text-sm text-white/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
              <Sparkles style={{ width: "1.1rem", height: "1.1rem" }} />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-white">PandiCRM</p>
              <p className="text-white/60">Your all-in-one workspace for CRM, notes, and project management.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-white/60">
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#how-it-works">
              How It Works
            </a>
            <a className="transition hover:text-white" href="/privacy">
              Privacy
            </a>
            <a className="transition hover:text-white" href="/terms">
              Terms
            </a>

            <div className="mx-2 h-5 w-px bg-white/20" />

            <div className="flex items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  <item.icon style={{ width: "1rem", height: "1rem" }} />
                </a>
              ))}
            </div>
          </div>

          <p>© {new Date().getFullYear()} PandiCRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
