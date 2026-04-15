import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Zap, BarChart2, Music2, DollarSign, FileText, Users, CheckCircle2, ArrowRight, Mic2, MapPin, BookOpen, Wand2, Link2, TrendingUp, Lightbulb, Rocket, Target, Send, CalendarDays, Newspaper, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "AI Release Plans",
    desc: "Submit your song metadata and get a full release strategy in 60 seconds — algorithm outlook, content ideas, playlist pitches, and a 7-day pre-release plan.",
  },
  {
    icon: BarChart2,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Analytics Dashboard",
    desc: "Track streaming KPIs, social asset engagement, platform breakdown, and per-song performance trends — all in one place.",
  },
  {
    icon: Music2,
    color: "text-[#1DB954]",
    bg: "bg-[#1DB954]/10",
    border: "border-[#1DB954]/20",
    title: "Spotify Intelligence",
    desc: "Connect your Spotify artist profile to see real-time monthly listeners, follower growth, popularity scores, and genre profile.",
  },
  {
    icon: Send,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Distribution Manager",
    desc: "Generate ISRC codes, manage metadata delivery, set up pre-save links, and track your entire distributor submission checklist per release.",
  },
  {
    icon: DollarSign,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    title: "Budget Tracker",
    desc: "Log studio time, music video costs, ad spend, and revenue streams. Visualize your ROI with real charts so you know exactly what's working.",
  },
  {
    icon: FileText,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Pitch Deck Generator",
    desc: "One click generates a professional PDF presentation — pulling streaming data, song catalog, and artist bio — ready to send to labels and talent agents.",
  },
  {
    icon: CalendarDays,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
    title: "Release Calendar",
    desc: "Plan every pre-release task on a visual calendar, sync with Google Calendar, and stay on top of critical deadlines for every drop.",
  },
  {
    icon: Users,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Collaboration Tools",
    desc: "Invite producers, managers, and band members to view and comment on any report. Leave section-specific feedback and resolve threads together.",
  },
  {
    icon: Mic2,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    title: "Playlist Pitcher",
    desc: "AI matches your song to 40+ curated independent Spotify playlists by genre and mood, then writes a personalized pitch email to each curator in one click.",
  },
  {
    icon: MapPin,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "Gig Finder",
    desc: "Browse 20+ real independent venues across the US filtered by genre, city, and type. Get an AI-written booking inquiry email for any venue instantly.",
  },
  {
    icon: BookOpen,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Algorithm Guide",
    desc: "A full deep-dive guide on how Spotify's algorithm works — covering release timing, engagement signals, playlist strategy, profile optimization, and the 7 biggest mistakes to avoid.",
  },
  {
    icon: Wand2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "AI Mastering",
    desc: "Upload your track and get a professionally mastered WAV — AI-tuned EQ, multiband compression, peak limiting, and -14 LUFS normalization for streaming.",
  },
  {
    icon: Link2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Link-in-Bio Builder",
    desc: "Build a custom release landing page with your song streaming links, tour dates, and merch — auto-pulled from your app data. Choose from 6 visual themes.",
  },
  {
    icon: TrendingUp,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    title: "Royalty Dashboard",
    desc: "Upload CSV royalty statements from DistroKid, TuneCore, or CD Baby. Visualize total earnings over time, broken down by platform and individual song.",
  },
  {
    icon: Newspaper,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    title: "Press Kit Generator",
    desc: "Auto-generate a professional EPK (Electronic Press Kit) with artist bio, streaming stats, song descriptions, and curated press quotes — ready to email to press and promoters.",
  },
  {
    icon: BarChart2,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    title: "Streaming Stats",
    desc: "Track real-time streaming performance per release — total streams, saves, playlist adds, skip rate, and AI-generated projections vs actuals.",
  },
];

const WHO_ITS_FOR = [
  { label: "Independent Artists", desc: "No label, no manager — SoundReady gives you the tools that used to require a whole team." },
  { label: "Emerging Producers", desc: "Understand how your tracks will perform algorithmically before you pitch them to anyone." },
  { label: "Music Managers", desc: "Manage multiple artist releases, track ROI, and generate pitch decks without the back-and-forth." },
  { label: "DIY Labels", desc: "Run distribution checklists, monitor catalog analytics, and build professional presentations at scale." },
];

export default function About() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 py-32 text-center bg-gradient-to-b from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
              <Rocket className="h-3.5 w-3.5" />
              The AI Release Platform Built for Independent Artists
            </div>
            <h1 className="font-heading text-6xl sm:text-7xl font-black tracking-tight leading-tight">
              Release <span className="text-primary">smarter.</span><br />
              Grow <span className="text-primary">faster.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-body">
              SoundReady eliminates the guesswork. In 60 seconds, get a complete release strategy powered by real music industry data, algorithm insights, and AI that thinks like an A&R.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-4">
            {isAuth ? (
              <Link to="/dashboard"><Button size="lg" className="gap-2 font-heading font-bold text-base px-8">Generate Release Plan <ArrowRight className="h-4 w-4" /></Button></Link>
            ) : (
              <Button size="lg" className="gap-2 font-heading font-bold text-base px-8" onClick={() => base44.auth.redirectToLogin()}>Sign In <ArrowRight className="h-4 w-4" /></Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* The Problem */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Problem</p>
            <h2 className="font-heading text-4xl font-bold">You're competing against major label artists.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Independent artists have all the same tools as majors — but none of the knowledge. No strategy consultant. No algorithm specialist. No booking team. No PR agency. You're flying blind while label artists have a whole playbook.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Solution</p>
            <h2 className="font-heading text-4xl font-bold">SoundReady is your invisible A&R team.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AI-powered strategy meets real music industry knowledge. Within 60 seconds of describing your song, you get the exact playbook major label artists follow — release timing, algorithm targeting, content strategy, playlist pitches, and booking angles. Then track everything and optimize in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The SoundReady Advantage</p>
            <h2 className="font-heading text-4xl font-bold">25+ integrated tools that work together.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every tool connects. Release data powers your analytics. Analytics inform your next release strategy. Built as one system, not a collection of apps.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-2xl bg-card border ${f.border} p-5 space-y-3`}>
                <div className={`h-9 w-9 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center`}>
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <p className="font-heading font-bold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-4 py-24 border-t border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">Who Should Use SoundReady</p>
            <h2 className="font-heading text-4xl font-bold">Made for serious independent artists.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {WHO_ITS_FOR.map((w, i) => (
              <motion.div key={w.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-base">{w.label}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{w.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
              <p className="font-heading text-4xl sm:text-5xl font-black text-primary">60s</p>
              <p className="text-sm text-muted-foreground">Get a full release strategy</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center space-y-2">
              <p className="font-heading text-4xl sm:text-5xl font-black text-primary">25+</p>
              <p className="text-sm text-muted-foreground">Integrated tools & features</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center space-y-2">
              <p className="font-heading text-4xl sm:text-5xl font-black text-primary">1</p>
              <p className="text-sm text-muted-foreground">Unified platform</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">Transparent Pricing</p>
            <h2 className="font-heading text-4xl font-bold">Choose your plan.</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </motion.div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Free", price: "$0", features: ["1 analysis/month", "Algorithm Outlook", "Playlist Pitch"], cta: "Get Started" },
              { name: "Starter", price: "$9.99/mo", features: ["3 analyses/month", "Full reports", "PDF download", "Save 10 reports"], cta: "Start Starter" },
              { name: "Pro", price: "$24.99/mo", features: ["Unlimited analyses", "Everything in Starter", "Curator CRM", "Release Planner"], cta: "Go Pro", highlighted: true },
              { name: "Label", price: "$79.99/mo", features: ["Everything in Pro", "10 artist profiles", "Team access", "Dedicated support"], cta: "Contact Sales" },
            ].map((plan, i) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border p-5 flex flex-col ${plan.highlighted ? "bg-card ring-2 ring-primary/40 shadow-lg" : "bg-card border-border"}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <p className="font-heading font-bold text-lg mb-1">{plan.name}</p>
                <p className="text-2xl font-black mb-4">{plan.price}</p>
                <div className="space-y-1.5 flex-1 mb-4">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant={plan.highlighted ? "default" : "outline"} className="w-full text-xs font-semibold">
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link to="/pricing">
              <Button variant="outline" className="gap-2">
                View Full Pricing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-5xl font-bold">Your strategy starts here.</h2>
            <p className="text-lg text-muted-foreground">Upload your song. Get your release plan. Execute like a major label.</p>
          </div>
          {isAuth ? (
        <Link to="/release-plan"><Button size="lg" className="gap-2 font-heading font-bold text-base px-8">Generate Release Plan Free <Rocket className="h-4 w-4" /></Button></Link>
      ) : (
        <Button size="lg" className="gap-2 font-heading font-bold text-base px-8" onClick={() => base44.auth.redirectToLogin()}>Get Started Free <Rocket className="h-4 w-4" /></Button>
      )}
        </motion.div>
      </section>
    </div>
  );
}