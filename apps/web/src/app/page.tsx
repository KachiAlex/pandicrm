export default function Home() {
  return (
    <div className="relative isolate flex flex-col min-h-[100svh] bg-surface">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <header className="relative z-10 px-6 py-8 sm:px-10">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-border/60 bg-white/70 p-4 shadow-[0_20px_60px_-30px_rgba(147,51,234,0.35)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_18px_45px_-20px_rgba(147,51,234,0.65)]">
              <span className="font-semibold">PC</span>
            </div>
            <div className="leading-tight">
              <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted">Pandi CRM</span>
              <p className="font-display text-lg font-semibold text-base-900">Intelligent Revenue Rituals</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted sm:flex">
            <a className="hover:text-base-900" href="#features">
              Features
            </a>
            <a className="hover:text-base-900" href="#dashboard">
              Dashboard
            </a>
            <a className="hover:text-base-900" href="#testimonials">
              Testimonials
            </a>
            <a className="hover:text-base-900" href="#pricing">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <a className="rounded-full border border-border px-5 py-2.5 text-muted transition hover:border-transparent hover:text-base-900 hover:shadow-[0_12px_32px_-18px_rgba(147,51,234,0.35)]" href="/signin">
              Sign in
            </a>
            <a className="rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary px-5 py-2.5 text-white shadow-[0_16px_35px_-18px_rgba(147,51,234,0.65)] transition hover:shadow-[0_24px_45px_-22px_rgba(147,51,234,0.6)]" href="/signup">
              Start free trial
            </a>
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-7xl px-6 pb-32 pt-16 sm:px-10 lg:pt-24">
          <div className="text-center">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-purple-200">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm text-primary font-semibold">AI-Powered Workspace</span>
            </div>
            
            {/* Hero Title */}
            <h1 className="font-display text-6xl leading-[1.08] text-base-900 sm:text-7xl lg:text-8xl mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                Your All-in-One Workspace
              </span>
              <br />
              for Success
            </h1>
            
            {/* Hero Description */}
            <p className="max-w-2xl mx-auto text-xl leading-[1.6] text-base-700 mb-12">
              Streamline your workflow with intelligent CRM, AI-powered note-taking, and seamless project management. All in one beautiful platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <a className="group inline-flex items-center gap-3 rounded-full bg-base-900 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all hover:bg-base-800 hover:shadow-3xl hover:-translate-y-0.5" href="/signup">
                <span>Get Started Free</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a className="inline-flex items-center gap-3 rounded-full border-2 border-border bg-white/80 px-8 py-4 text-lg font-semibold text-base-900 shadow-lg backdrop-blur transition-all hover:border-primary hover:bg-white hover:-translate-y-0.5" href="#tour">
                <span>Watch Demo</span>
              </a>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { value: "50K+", label: "Active Users" },
                { value: "1M+", label: "Tasks Completed" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-100"
                >
                  <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-display text-3xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-base-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-display text-4xl font-bold">
                Everything You Need to Succeed
              </h2>
              <p className="text-base-600 max-w-2xl mx-auto text-lg">
                Powerful features designed to help you work smarter, not harder.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "👥",
                  title: "Smart CRM",
                  description: "Manage your customer relationships with AI-powered insights and automation.",
                  color: "from-primary to-primary/70"
                },
                {
                  icon: "🧠",
                  title: "AI Note-Taking",
                  description: "Capture ideas instantly with intelligent organization and smart suggestions.",
                  color: "from-secondary to-secondary/70"
                },
                {
                  icon: "✓",
                  title: "Task Management",
                  description: "Stay on top of your work with intuitive task tracking and prioritization.",
                  color: "from-primary to-secondary"
                },
                {
                  icon: "📊",
                  title: "Analytics Dashboard",
                  description: "Gain insights with beautiful visualizations and real-time reports.",
                  color: "from-secondary to-primary"
                },
                {
                  icon: "📅",
                  title: "Project Timeline",
                  description: "Visualize your projects and deadlines with interactive timelines.",
                  color: "from-primary to-tertiary"
                },
                {
                  icon: "⚡",
                  title: "Automation",
                  description: "Automate repetitive tasks and focus on what matters most.",
                  color: "from-tertiary to-secondary"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 border border-purple-100 hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-base-900 font-semibold text-lg">{feature.title}</h3>
                  <p className="text-base-600">{feature.description}</p>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="dashboard" className="py-24 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-display text-4xl font-bold">
                Track Your Progress at a Glance
              </h2>
              <p className="text-base-600 max-w-2xl mx-auto text-lg">
                Get real-time insights into your productivity and business growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { icon: "👥", label: "Active Clients", value: "1,234", change: "+12%", color: "purple" },
                { icon: "📝", label: "Notes Created", value: "5,678", change: "+8%", color: "pink" },
                { icon: "✓", label: "Tasks Done", value: "890", change: "+23%", color: "purple" },
                { icon: "📈", label: "Productivity", value: "94%", change: "+5%", color: "pink" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    stat.color === 'purple' ? 'from-primary to-primary/70' : 'from-secondary to-secondary/70'
                  } flex items-center justify-center mb-4 text-2xl`}>
                    {stat.icon}
                  </div>
                  <div className="text-base-500 mb-1">{stat.label}</div>
                  <div className="flex items-end justify-between">
                    <span className="text-base-900 font-semibold text-lg">{stat.value}</span>
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base-900 font-semibold text-lg">Recent Activity</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm hover:shadow-lg transition-shadow">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { title: "Client meeting notes updated", time: "2 minutes ago", color: "purple" },
                    { title: "New task assigned to Marketing Team", time: "15 minutes ago", color: "pink" },
                    { title: "Project milestone completed", time: "1 hour ago", color: "purple" },
                    { title: "AI generated summary for Q1 report", time: "2 hours ago", color: "pink" },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                        activity.color === 'purple' ? 'from-primary to-primary/70' : 'from-secondary to-secondary/70'
                      }`} />
                      <div className="flex-1">
                        <div className="text-base-900">{activity.title}</div>
                        <div className="text-sm text-base-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-display text-4xl font-bold">
                Loved by Teams Worldwide
              </h2>
              <p className="text-base-600 max-w-2xl mx-auto text-lg">
                See what our users have to say about their experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "CEO, TechStart",
                  content: "This platform transformed how we manage our customer relationships. The AI features are incredibly intuitive!",
                  avatar: "SJ",
                  rating: 5,
                },
                {
                  name: "Michael Chen",
                  role: "Product Manager",
                  content: "The note-taking AI is a game-changer. It understands context and helps me organize thoughts effortlessly.",
                  avatar: "MC",
                  rating: 5,
                },
                {
                  name: "Emily Rodriguez",
                  role: "Freelance Designer",
                  content: "I've tried many project management tools, but this one actually helps me stay productive without overwhelming me.",
                  avatar: "ER",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-base-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-base-900 font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-base-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-white/10 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-sm text-white font-semibold">Start Your Free Trial Today</span>
            </div>

            <h2 className="mb-6 text-white font-display text-4xl font-bold">
              Ready to Transform Your Workflow?
            </h2>

            <p className="mb-10 text-white/90 max-w-2xl mx-auto text-lg">
              Join thousands of teams who are already working smarter with our AI-powered platform. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <a className="group inline-flex items-center gap-3 rounded-full bg-white text-primary px-8 py-4 text-lg font-semibold shadow-2xl transition-all hover:shadow-3xl hover:-translate-y-0.5" href="/signup">
                <span>Get Started Free</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a className="inline-flex items-center gap-3 rounded-full bg-white/20 backdrop-blur-sm text-white px-8 py-4 text-lg font-semibold border border-white/30 transition-all hover:bg-white/30" href="#demo">
                <span>Schedule a Demo</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-white/70 py-10 text-sm text-muted">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-semibold shadow-[0_20px_45px_-24px_rgba(91,75,255,0.55)]">
              PC
            </span>
            <p className="font-display text-base text-base-900">Pandi CRM</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a className="hover:text-base-900" href="mailto:hello@pandicrm.com">
              hello@pandicrm.com
            </a>
            <a className="hover:text-base-900" href="/privacy">
              Privacy
            </a>
            <a className="hover:text-base-900" href="/terms">
              Terms
            </a>
          </div>
          <p>© {new Date().getFullYear()} Pandi CRM Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
