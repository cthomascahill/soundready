import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Flame, Zap, BarChart2, Music2, DollarSign, FileText, Users,
  CheckCircle2, Mic2, MapPin, BookOpen, Wand2, Link2, TrendingUp, Newspaper,
  Send, CalendarDays, AlertTriangle, Clock, PhoneOff, TrendingDown, Star,
  Briefcase, Bot, UserCheck, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MANAGER_PAINS = [
  { icon: DollarSign, text: "Takes 15–20% of everything you earn — forever" },
  { icon: PhoneOff, text: "Doesn't return your calls for days" },
  { icon: AlertTriangle, text: "Pitches you to the wrong opportunities" },
  { icon: Clock, text: "You wait on them for things you could do yourself" },
  { icon: TrendingDown, text: "Has 12 other artists they care about more" },
  { icon: FileText, text: "Sends vague 'update' emails that say nothing" },
];

const TIERS = [
  {
    icon: Zap,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Artist",
    tagline: "You're the manager now.",
    price: "$37/mo",
    desc: "Every tool SoundReady has in your hands. You make the decisions, SoundReady gives you everything you need to make the right ones.",
    items: [
      "Full song library & workspace",
      "AI release strategy & song analysis",
      "AI mastering",
      "Playlist pitching & sync licensing",
      "Gig finder & tour planner",
      "Finance & royalty tracker",
      "Legal templates & contract analyzer",
      "A&R Intelligence & Release Radar",
      "Fan Intelligence dashboard",
      "Music academy",
    ],
    cta: "Get Started",
  },
  {
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    name: "Pro",
    tagline: "You and your team.",
    price: "$67/mo",
    badge: "Most Popular",
    desc: "Everything in Artist plus the ability to bring your whole team into one place. Your manager, producer, and publicist all working from the same platform — no more scattered emails and missed updates.",
    items: [
      "Everything in Artist",
      "Invite up to 3 team members",
      "Collaborative whiteboard & shared workspaces",
      "Team role assignments (Manager, Producer, Label Rep)",
      "Priority support",
    ],
    cta: "Get Started",
  },
  {
    icon: Briefcase,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    name: "Label",
    tagline: "Run your whole roster.",
    price: "$97/mo",
    desc: "Everything in Pro built for indie labels and managers running multiple artists. One login, every artist, every release, every deal — all in one place.",
    items: [
      "Everything in Pro",
      "Unlimited team members",
      "Unlimited song library",
      "Multiple artist profiles under one account",
      "Dedicated onboarding support",
      "First access to new features",
    ],
    cta: "Apply Now",
  },
];

const WHAT_WE_DO = [
  { icon: Zap, color: "text-primary", title: "Release Strategy", desc: "60-second AI release plan with algorithm outlook, content ideas, and a 7-day pre-release schedule." },
  { icon: Mic2, color: "text-chart-3", title: "Playlist Pitching", desc: "AI matches your track to 40+ curated playlists and writes personalized curator pitches in one click." },
  { icon: FileText, color: "text-purple-400", title: "Press & EPK", desc: "Auto-generate a full Electronic Press Kit with bio, stats, and press quotes — ready to send." },
  { icon: MapPin, color: "text-orange-400", title: "Booking & Tours", desc: "Discover independent venues, generate booking inquiries, plan routes, and track tour finances." },
  { icon: DollarSign, color: "text-chart-4", title: "Finance & Royalties", desc: "Upload royalty statements, log expenses, track revenue streams, and see exactly what's working." },
  { icon: Send, color: "text-teal-400", title: "Distribution", desc: "Generate ISRCs, manage metadata, set up pre-saves, and track your full distributor checklist." },
  { icon: Music2, color: "text-[#1DB954]", title: "Sync Licensing", desc: "Surface matching opportunities for TV, film, games, and commercials. AI writes the pitch." },
  { icon: Wand2, color: "text-cyan-400", title: "AI Mastering", desc: "Professional WAV output — AI-tuned EQ, compression, and -14 LUFS normalization for streaming." },
];

export default function About() {
  const [isAuth, setIsAuth] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/dashboard";
    else base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold tracking-wider uppercase">
            <Flame className="h-3.5 w-3.5" />
            The Artist Management Revolution
          </motion.div>

          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            Fire your<br />
            <span className="text-primary">manager.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-body">
            Meet SoundReady — the AI-powered platform that does everything your manager does,
            without taking <span className="text-foreground font-semibold">15–20% of your income.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="gap-2 font-heading font-bold text-base px-8 h-12">
                See Pricing
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">From $37/mo. No contracts. No percentage cuts. Cancel anytime.</p>
        </motion.div>
      </section>

      {/* THE PROBLEM — manager relationship */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14 space-y-4">
            <p className="text-xs text-destructive uppercase tracking-wider font-bold">Sound familiar?</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">Your manager is costing you more than money.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The artist-manager relationship is one of the most dysfunctional in the music industry. Here's what you're actually paying for.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MANAGER_PAINS.map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-destructive/5 border border-destructive/15">
                <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <p.icon className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-sm leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="mt-10 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center space-y-3">
            <p className="font-heading text-2xl font-bold">If you earn $50,000 this year, your manager takes $7,500–$10,000.</p>
            <p className="text-muted-foreground">SoundReady costs $444–$1,164/year. That's the math.</p>
          </motion.div>
        </div>
      </section>

      {/* THE SOLUTION — 3 tiers */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">Pricing</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">Three ways SoundReady works for you.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Pay for the size of your operation — not for features. Every tier includes the full platform.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <motion.div key={tier.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-2xl border p-6 flex flex-col bg-card ${
                  tier.badge ? "ring-2 ring-primary/40 shadow-xl" : ""
                } ${tier.border}`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}
                <div className={`h-11 w-11 rounded-xl ${tier.bg} border ${tier.border} flex items-center justify-center mb-4`}>
                  <tier.icon className={`h-5 w-5 ${tier.color}`} />
                </div>
                <p className="font-heading font-black text-2xl">{tier.name}</p>
                <p className={`text-sm font-semibold mt-0.5 mb-2 ${tier.color}`}>{tier.tagline}</p>
                <p className="text-2xl font-black mb-3">{tier.price}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tier.desc}</p>
                <div className="space-y-2 flex-1">
                  {tier.items.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${tier.color}`} />
                      <span className="text-xs text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={tier.cta === "Apply Now" ? () => setShowLabelModal(true) : handleCTA}
                >
                  {tier.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Label Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowLabelModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowLabelModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-2">
              <p className="text-xs text-primary uppercase tracking-widest font-bold">Label Plan</p>
              <h3 className="font-heading text-2xl font-bold">Let's get your roster set up.</h3>
              <p className="text-muted-foreground text-sm">Book a quick 15-minute call with our team.</p>
            </div>
            <div className="rounded-xl bg-secondary/50 border border-border h-48 flex items-center justify-center text-muted-foreground text-sm">
              {/* Calendly embed placeholder */}
              Calendly embed coming soon
            </div>
          </motion.div>
        </div>
      )}

      {/* WHAT WE DO */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Toolkit</p>
            <h2 className="font-heading text-4xl font-bold">Everything a manager does. Nothing a manager doesn't.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">25+ integrated tools covering every part of your career — all in one platform.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_WE_DO.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl bg-card border border-border p-5 space-y-3 hover:border-primary/30 transition-colors">
                <f.icon className={`h-6 w-6 ${f.color}`} />
                <p className="font-heading font-bold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">Who It's For</p>
            <h2 className="font-heading text-4xl font-bold">Built for every level of independent artist.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { level: "Unsigned Artist", desc: "You're self-managing and flying blind. SoundReady gives you the exact same tools a signed artist's manager uses — from day one." },
              { level: "Emerging Artist", desc: "You're gaining traction but your manager isn't moving fast enough. Let AI handle the hustle while you focus on the music." },
              { level: "Mid-Tier Artist", desc: "You're making real money and tired of losing 20% to someone who isn't doing 20% of the work. Time to reclaim your income." },
            ].map((w, i) => (
              <motion.div key={w.level}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border space-y-3">
                <div className="inline-flex px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold">{w.level}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Results</p>
            <h2 className="font-heading text-4xl font-bold">Artists who use SoundReady don't just sound better. They earn more.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { num: "+200%", label: "Average revenue increase", sub: "Artists using SoundReady's finance + pitching tools report doubling — or tripling — their annual music income within 12 months." },
              { num: "+78%", label: "Increase in streams", sub: "Releases planned with SoundReady's AI strategy consistently outperform unmanaged releases across Spotify, Apple Music, and TikTok." },
              { num: "+120%", label: "More gigs booked", sub: "Artists using our booking tools, venue CRM, and AI-drafted outreach book over twice as many shows as those sending cold emails manually." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-card border border-primary/20 p-6 space-y-3 text-center">
                <p className="font-heading text-5xl font-black text-primary">{s.num}</p>
                <p className="font-heading font-bold text-base">{s.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.sub}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">Based on average outcomes reported by SoundReady artists across all tiers.</p>
        </div>
      </section>

      {/* THE MATH */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {[
              { num: "15–20%", sub: "What a manager takes from every dollar you earn" },
              { num: "$37/mo", sub: "Starting price for SoundReady — all tools included" },
              { num: "25+", sub: "Integrated tools replacing your entire management team" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="space-y-2">
                <p className="font-heading text-3xl sm:text-5xl font-black text-primary">{s.num}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-5xl sm:text-6xl font-black">
              Fire your manager.<br />
              <span className="text-primary">Meet SoundReady.</span>
            </h2>
            <p className="text-lg text-muted-foreground">Start free. No credit card required. No percentage cuts. Ever.</p>
          </div>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-13" onClick={handleCTA}>
            Get Started Free <Flame className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">Join thousands of independent artists managing their careers smarter.</p>
        </motion.div>
      </section>
    </div>
  );
}