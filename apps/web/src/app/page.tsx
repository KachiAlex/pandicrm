"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, PlayCircle, Mic, CheckSquare, GitBranch, BarChart2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("active")),
      { threshold: 0.07 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function HomePage() {
  useReveal();

  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden" style={{ background: "linear-gradient(180deg,#fff4fb 0%,#fff 55%)" }}>
      <div className="orb orb-a" style={{ width: 780, height: 780, top: -160, left: "50%", transform: "translateX(-50%)", opacity: 0.65 }} />
      <div className="orb orb-b" style={{ width: 440, height: 440, top: 220, right: -140, opacity: 0.5 }} />
      <div className="orb orb-c" style={{ width: 360, height: 360, bottom: 60, left: -80, opacity: 0.45 }} />
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center">
        <div className="pill mb-7 mx-auto" style={{ width: "fit-content" }}><span className="pldot" />AI-Powered CRM — Early Access</div>
        <h1 className="font-black leading-[1.01] tracking-[-0.03em] mb-6 max-w-4xl mx-auto reveal" style={{ fontSize: "clamp(42px,7.5vw,88px)" }}>
          Customer Relations<br/>has never been<br/><span className="tg">this easy.</span>
        </h1>
        <p className="text-gray-500 leading-relaxed max-w-xl mx-auto mb-10 reveal rd1" style={{ fontSize: 18 }}>
          pandicrm combines AI meeting notes, smart task boards, visual pipeline tracking, and deep reporting so your team can focus on people — not paperwork.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 reveal rd2">
          <Link href="/login" className="btn-p px-8 py-4 text-base">Get started free <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/dashboard" className="btn-g px-7 py-4 text-base"><PlayCircle className="w-4 h-4" /> See the dashboard</Link>
        </div>
        <p className="mt-5 text-sm text-gray-400 reveal rd3">No credit card required · Free plan available</p>
        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative max-w-4xl mx-auto mt-14 reveal rd2">
      <div className="absolute inset-x-16 -bottom-5 h-12 rounded-full blur-2xl" style={{ background: "rgba(255,26,151,0.18)" }} />
      <div className="surf fla" style={{ borderRadius: 22, overflow: "hidden" }}>
        <div className="flex items-center gap-1.5 px-4 h-9 border-b border-gray-100" style={{ background: "#f9fafb" }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="flex-1 mx-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center"><span style={{ fontSize: 9, color: "#9ca3af" }}>app.pandicrm.com/dashboard</span></div>
        </div>
        <div className="flex" style={{ minHeight: 300 }}>
          <div className="w-44 p-2.5 flex-col gap-0.5 hidden sm:flex dash-sb">
            <div className="flex items-center gap-1.5 px-2 py-2.5 mb-1">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}>
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M7 12.5C7 12.5 1.5 8.833 1.5 5A3.5 3.5 0 0 1 7 2.917 3.5 3.5 0 0 1 12.5 5C12.5 8.833 7 12.5 7 12.5Z" fill="white" /></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>pandicrm</span>
            </div>
            <div className="dni on"><BarChart2 className="w-3 h-3" />Dashboard</div>
            <div className="dni"><Mic className="w-3 h-3" />AI Notes</div>
            <div className="dni"><CheckSquare className="w-3 h-3" />Tasks</div>
            <div className="dni"><GitBranch className="w-3 h-3" />Pipeline</div>
            <div className="dni"><BarChart2 className="w-3 h-3" />Reports</div>
          </div>
          <div className="flex-1 p-4" style={{ background: "#f5f5f7" }}>
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm"><p style={{ fontSize: 9, color: "#9ca3af" }}>Total Deals</p><p style={{ fontSize: 16, fontWeight: 800, color: "#0d0d12" }}>$248K</p><span className="sup">+12%</span></div>
              <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm"><p style={{ fontSize: 9, color: "#9ca3af" }}>Win Rate</p><p style={{ fontSize: 16, fontWeight: 800, color: "#0d0d12" }}>68%</p><span className="sup">+4%</span></div>
              <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm"><p style={{ fontSize: 9, color: "#9ca3af" }}>Open Tasks</p><p style={{ fontSize: 16, fontWeight: 800, color: "#0d0d12" }}>24</p><span className="sdn">-3</span></div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <p style={{ fontSize: 9, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Pipeline</p>
              <div className="flex gap-2">
                {["Lead","Qualify","Propose","Won"].map((s,i) => (
                  <div key={s} className="flex-1 text-center">
                    <div className="h-1 rounded-full mb-1" style={{ background: i===0?"linear-gradient(90deg,#ff1a97,#b80055)":i===3?"#4ade80":"#ffadd9" }} />
                    <p style={{ fontSize: 8, color: "#9ca3af" }}>{s}</p><p style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{[8,5,4,3][i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="glass absolute -left-6 top-24 p-3 flb hidden md:block" style={{ zIndex: 10, width: 172 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}><Mic className="w-3.5 h-3.5 text-white" /></div>
          <div><p style={{ fontSize: 10, fontWeight: 600, color: "#0d0d12" }}>AI Note Ready</p><p style={{ fontSize: 9, color: "#9ca3af" }}>Just transcribed</p></div>
        </div>
        <p style={{ fontSize: 9.5, color: "#4b5563", lineHeight: 1.5 }}>&ldquo;Follow up with Sarah re: Q3 expansion.&rdquo;</p>
      </div>
      <div className="glass absolute -right-5 top-12 p-3 flc hidden md:block" style={{ zIndex: 10, width: 148 }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>This Month</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#0d0d12", lineHeight: 1 }}>$81K</p>
        <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>Revenue closed</p>
        <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: "73%", background: "linear-gradient(90deg,#ff1a97,#b80055)" }} /></div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 overflow-hidden bg-white">
      <div className="orb orb-c" style={{ width: 560, height: 560, top: -60, right: -180, opacity: 0.55 }} />
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <div className="pill mb-5 mx-auto" style={{ width: "fit-content" }}>Features</div>
          <h2 className="font-black tracking-[-0.03em] leading-[1.06] mb-4" style={{ fontSize: "clamp(30px,5vw,54px)" }}>Everything your team needs<br/><span className="tg">in one place.</span></h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed" style={{ fontSize: 17 }}>From first contact to closed deal — pandicrm handles every touchpoint with intelligence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FeatureCard icon={<Mic className="w-5 h-5" />} title="AI Note Taker" delay="rd1"
            desc="Join every meeting with a silent AI co-pilot. Get structured summaries, action items, and CRM updates — automatically, the moment the call ends."
            demo={<div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}><Sparkles className="w-3 h-3 text-white" /></div>
                <div><p style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 2 }}>AI Summary</p><p style={{ fontSize: 11.5, color: "#6b7280" }}>Acme Corp call: Budget confirmed $24K. Decision next Friday. Key concern: onboarding timeline.</p></div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Action Items</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded flex-shrink-0" style={{ border: "2px solid #ff1a97", background: "#fff0f7" }} /><p style={{ fontSize: 11.5, color: "#4b5563" }}>Send onboarding deck to Sarah by Thu</p></div>
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded flex-shrink-0 border-2 border-gray-300" /><p style={{ fontSize: 11.5, color: "#4b5563" }}>Schedule technical review call</p></div>
                </div>
              </div>
            </div>}
          />
          <FeatureCard icon={<CheckSquare className="w-5 h-5" />} title="Task Manager" delay="rd2"
            desc="Smart task boards that stay in sync with your deals. Assign, prioritize, and track follow-ups — with AI-suggested next actions for every contact."
            demo={<div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex flex-col gap-2">
                {[{ t: "Follow up with TechCorp demo", s: "Today", done: false },{ t: "Send proposal to Meridian Inc", s: "Done", done: true },{ t: "Prepare Q4 pipeline review", s: "Fri", done: false }].map((task) => (
                  <div key={task.t} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100 shadow-sm">
                    <div className={`w-4 h-4 rounded flex-shrink-0 ${task.done ? "rounded-full flex items-center justify-center" : ""}`} style={task.done ? { border: "2px solid #22c55e", background: "#f0fdf4" } : { border: "2px solid #ff1a97", background: "#fff0f7" }}>
                      {task.done && <CheckSquare className="w-2.5 h-2.5" style={{ color: "#22c55e" }} />}
                    </div>
                    <p style={{ fontSize: 11.5, fontWeight: task.done ? 400 : 500, color: task.done ? "#9ca3af" : "#374151", textDecoration: task.done ? "line-through" : "none", flex: 1 }}>{task.t}</p>
                    <span style={{ fontSize: 10, color: task.done ? "#16a34a" : task.s === "Today" ? "#b80055" : "#6b7280", background: task.done ? "#f0fdf4" : task.s === "Today" ? "#fff0f7" : "#f3f4f6", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>{task.s}</span>
                  </div>
                ))}
              </div>
            </div>}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard icon={<GitBranch className="w-5 h-5" />} title="Pipeline Tracking" delay="rd1"
            desc="Visual kanban-style pipeline with drag-and-drop deals. See where every opportunity stands, spot bottlenecks, and forecast revenue with confidence."
            demo={<div className="flex gap-2 overflow-hidden">
              {[{ label: "Lead", color: "#ff1a97", items: [{n:"Apex Media",v:"$12,000"},{n:"TechCorp",v:"$8,500"}] },{ label: "Qualify", color: "#ffadd9", items: [{n:"Acme Corp",v:"$24,000",hot:true}] },{ label: "Won", color: "#4ade80", items: [{n:"Meridian",v:"+$18K"}] }].map((col) => (
                <div key={col.label} className="flex-1">
                  <div className="flex items-center gap-1 mb-2"><div className="w-2 h-2 rounded-full" style={{ background: col.color }} /><p style={{ fontSize: 9, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em" }}>{col.label}</p></div>
                  {col.items.map((item: any) => (
                    <div key={item.n} className={`pkc ${item.hot ? "border-pk-200" : col.label === "Won" ? "border-green-100" : ""}`} style={item.hot ? { boxShadow: "0 2px 8px rgba(255,26,151,0.07)" } : {}}>
                      <p style={{ fontWeight: 600, fontSize: 11, color: "#1f2937" }}>{item.n}</p>
                      <p style={{ color: col.label === "Won" ? "#16a34a" : "#9ca3af", fontSize: 10, fontWeight: col.label === "Won" ? 600 : 400 }}>{item.v}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>}
          />
          <FeatureCard icon={<BarChart2 className="w-5 h-5" />} title="Reporting" delay="rd2"
            desc="Real-time dashboards that surface what actually matters. Track win rates, revenue velocity, team performance, and churn signals — all at a glance."
            demo={<div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-end gap-1.5 mb-2" style={{ height: 72 }}>
                {[35,55,70,88,62,76].map((h,i) => (
                  <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i===3 ? "linear-gradient(180deg,#ff1a97,#b80055)" : ["#ffd6ec","#ffadd9","#ff80c4","","#ffadd9","#ff80c4"][i], boxShadow: i===3 ? "0 3px 12px rgba(184,0,85,0.28)" : "none" }} />
                ))}
              </div>
              <div className="flex justify-between" style={{ fontSize: 8.5, color: "#9ca3af" }}>
                {["Apr","May","Jun","Jul","Aug","Sep"].map((m,i) => <span key={m} style={{ color: i===3 ? "#b80055" : "#9ca3af", fontWeight: i===3 ? 600 : 400 }}>{m}</span>)}
              </div>
              <div className="mt-3 flex gap-2">
                {[{l:"Win Rate",v:"68%"},{l:"Avg Cycle",v:"18d"},{l:"Month",v:"$81K"}].map((stat) => (
                  <div key={stat.l} className="flex-1 bg-white rounded-xl p-2.5 border border-gray-100 text-center"><p style={{ fontSize: 13, fontWeight: 800, color: "#0d0d12" }}>{stat.v}</p><p style={{ fontSize: 9, color: "#9ca3af" }}>{stat.l}</p></div>
                ))}
              </div>
            </div>}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, demo, delay }: { icon: React.ReactNode; title: string; desc: string; demo: React.ReactNode; delay: string }) {
  return (
    <div className={`surf p-8 relative overflow-hidden reveal ${delay} group`}>
      <div className="fi mb-5">{icon}</div>
      <h3 className="font-bold tracking-tight text-gray-900 mb-2" style={{ fontSize: 19 }}>{title}</h3>
      <p className="text-gray-500 leading-relaxed mb-5" style={{ fontSize: 14 }}>{desc}</p>
      {demo}
    </div>
  );
}

function PricingSection() {
  return (
    <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(180deg,#fff 0%,#fff4fb 100%)" }}>
      <div className="orb orb-a" style={{ width: 520, height: 520, top: -60, left: "50%", transform: "translateX(-50%)", opacity: 0.2 }} />
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16 reveal">
          <div className="pill mb-5 mx-auto" style={{ width: "fit-content" }}>Pricing</div>
          <h2 className="font-black tracking-[-0.03em] leading-[1.07] mb-4" style={{ fontSize: "clamp(28px,4.5vw,52px)" }}>Simple pricing,<br/><span className="tg">when you&apos;re ready.</span></h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed" style={{ fontSize: 17 }}>We&apos;re in early access — join now and get exclusive founding member rates at launch.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="pc reveal rd1">
            <p style={{ fontSize: 10.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Starter</p>
            <div className="flex items-end gap-1 mb-1"><span style={{ fontSize: 38, fontWeight: 900, color: "#0d0d12", lineHeight: 1 }}>Free</span></div>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 22 }}>Forever. No credit card required.</p>
            <div className="flex flex-col gap-2.5 mb-8">
              {["Up to 2 users","50 AI notes/month","Basic pipeline view","Task manager"].map((f) => (
                <div key={f} className="flex items-center gap-2.5"><CheckSquare className="w-4 h-4 flex-shrink-0" style={{ color: "#b80055" }} /><span style={{ fontSize: 13.5, color: "#374151" }}>{f}</span></div>
              ))}
            </div>
            <Link href="/login" className="btn-g w-full justify-center py-3 text-sm">Get started</Link>
          </div>
          <div className="pc feat reveal rd2">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <p style={{ fontSize: 10.5, fontWeight: 600, color: "#ff66b3", textTransform: "uppercase", letterSpacing: ".06em" }}>Pro</p>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "#ff66b3", background: "rgba(255,26,151,0.15)", padding: "3px 9px", borderRadius: 999, border: "1px solid rgba(255,26,151,0.2)" }}>Most Popular</span>
            </div>
            <div className="flex items-end gap-1 mb-1 relative z-10"><span style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1 }}>?</span></div>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 22, position: "relative", zIndex: 10 }}>Founding member pricing coming soon.</p>
            <div className="flex flex-col gap-2.5 mb-8 relative z-10">
              {["Unlimited users","Unlimited AI notes","Full pipeline + reporting","Customer timelines","Priority support"].map((f) => (
                <div key={f} className="flex items-center gap-2.5"><CheckSquare className="w-4 h-4 flex-shrink-0" style={{ color: "#ff66b3" }} /><span style={{ fontSize: 13.5, color: "#d1d5db" }}>{f}</span></div>
              ))}
            </div>
            <Link href="/login" className="btn-p w-full justify-center py-3 text-sm relative z-10">Join waitlist <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="pc reveal rd3">
            <p style={{ fontSize: 10.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Enterprise</p>
            <div className="flex items-end gap-1 mb-1"><span style={{ fontSize: 38, fontWeight: 900, color: "#0d0d12", lineHeight: 1 }}>Custom</span></div>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 22 }}>Tailored for larger teams.</p>
            <div className="flex flex-col gap-2.5 mb-8">
              {["Everything in Pro","SSO & SCIM","Custom integrations","Dedicated CSM"].map((f) => (
                <div key={f} className="flex items-center gap-2.5"><CheckSquare className="w-4 h-4 flex-shrink-0" style={{ color: "#b80055" }} /><span style={{ fontSize: 13.5, color: "#374151" }}>{f}</span></div>
              ))}
            </div>
            <a href="mailto:hello@pandicrm.com" className="btn-g w-full justify-center py-3 text-sm">Talk to us</a>
          </div>
        </div>
      </div>
    </section>
  );
}
