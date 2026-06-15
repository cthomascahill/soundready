import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, ArrowRight, Zap, Users, Briefcase, Bot, Sparkles, X, Flame, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import SoundReadyLogo from "@/components/SoundReadyLogo";

const TIERS = [
  {
    icon: Zap,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Artist",
    tagline: "Your career. Your control.",
    price: "$37/mo",
    desc: "Every tool SoundReady has — in your hands. Upload songs, get your release strategy, master your tracks, pitch playlists, book shows, track your money, and protect yourself legally. Everything a manager does, for $37 a month.",
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
    cta: "Start Building My Career",
    subtext: "No free tier. No contracts. Cancel anytime.",
    badge: null,
    glow: false,
  },
  {
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    name: "Pro",
    tagline: "You and your team, finally in sync.",
    price: "$67/mo",
    badge: "Most Popular",
    badgeStyle: "bg-primary text-primary-foreground",
    glow: false,
    desc: "Everything in Artist, plus a shared workspace for your whole team. Your manager, producer, and publicist work from the same platform — same songs, same strategy, same plan. No missed emails. No dropped balls.",
    items: [
      "Everything in Artist",
      "Invite up to 3 team members",
      "Collaborative whiteboard & shared workspaces",
      "Team role assignments (Manager, Producer, Label Rep)",
      "Priority support",
    ],
    cta: "Start Building My Career",
    subtext: "No free tier. No contracts. Cancel anytime.",
  },
  {
    icon: Briefcase,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    name: "Label",
    tagline: "Your whole roster. One platform.",
    price: "$97/mo",
    badge: null,
    glow: false,
    desc: "Everything in Pro, built for indie labels and managers running multiple artists. Unlimited songs, unlimited team members, multiple artist profiles — all under one login.",
    items: [
      "Everything in Pro",
      "Unlimited team members",
      "Unlimited song library",
      "Multiple artist profiles under one account",
      "First access to new features",
    ],
    cta: "Start Building My Career",
    subtext: "No free tier. No contracts. Cancel anytime.",
  },
  {
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    name: "AI Manager",
    tagline: "Your career on autopilot.",
    price: "$200/mo",
    badge: "Most Powerful",
    badgeStyle: "bg-primary text-primary-foreground",
    glow: true,
    desc: "Everything in Label plus a dedicated AI that works your career around the clock. The moment you upload a song, SoundReady automatically pitches every matching playlist, monitors tour opportunities, and prepares booking outreach — all ready to send with one tap.",
    items: [
      "Everything in Label",
      "Auto-playlist pitching on every release",
      "Tour & gig opportunity alerts in your genre",
      "One-tap booking agent outreach",
      "Auto-generated EPK & press kit on upload",
      "Weekly AI career digest delivered to your inbox",
      "Priority support & dedicated onboarding",
    ],
    cta: "Get Started",
    subtext: "No contracts. Cancel anytime.",
  },
];

const FAQ = [
  {
    q: "Does SoundReady take a percentage of my income?",
    a: "Never. Unlike a traditional manager, SoundReady charges a flat monthly fee. You keep 100% of your earnings — always.",
  },
  {
    q: "What's the difference between Artist and Pro?",
    a: "Artist gives you every single tool on the platform. Pro adds a shared team workspace so your manager, producer, and publicist can all work from the same place at the same time.",
  },
  {
    q: "What makes AI Manager different from Label?",
    a: "AI Manager doesn't wait for you to act. The moment you upload a song, it pitches playlists, flags tour opportunities, and builds your EPK automatically. Everything is prepped and handed to you for one-tap approval.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments. Cancel anytime from your account settings. We're confident the platform speaks for itself.",
  },
  {
    q: "What file formats do you accept?",
    a: "MP3, WAV, AAC, and FLAC up to 50MB.",
  },
  {
    q: "Is my music kept private?",
    a: "Yes. Your uploaded tracks are never shared or used for any purpose other than powering your analysis and tools.",
  },
];

export default function Pricing() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/dashboard";
    else base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-background font-body">

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/"><SoundReadyLogo size={28} /></Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Home</Link>
            <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">How It Works</Link>
            <Button size="sm" className="font-semibold" onClick={handleCTA}>
              {isAuth ? "Go to Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-4xl mx-auto space-y-7">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
            <Flame className="h-3.5 w-3.5" />
            Simple, Transparent Pricing
          </motion.div>
          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            Pay for the size of<br />
            <span className="text-primary">your operation.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Every plan includes the full platform. No feature gates. No percentage cuts. No contracts. The only difference is how big your team is.
          </p>
          <p className="text-sm text-muted-foreground">Starting at $37/mo — less than a single manager meeting.</p>
        </motion.div>
      </section>

      {/* THE MATH */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-secondary border border-border p-8 text-center space-y-5">
            <DollarSign className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-heading text-2xl font-bold">The math doesn't lie.</h3>
            <div className="grid grid-cols-2 gap-4 text-center max-w-md mx-auto">
              <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4 space-y-1">
                <p className="font-heading text-3xl font-black text-destructive">$7,500+</p>
                <p className="text-xs text-muted-foreground">What a manager takes on $50K/year income</p>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-1">
                <p className="font-heading text-3xl font-black text-primary">$37/mo</p>
                <p className="text-xs text-muted-foreground">SoundReady — all tools, all features, zero cuts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TIER CARDS */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {TIERS.map((tier, i) => (
              <motion.div key={tier.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col bg-card ${
                  tier.badge === "Most Powerful" ? "ring-2 ring-primary/60 shadow-2xl shadow-primary/10" :
                  tier.badge === "Most Popular" ? "ring-2 ring-primary/40 shadow-xl" : ""
                } ${tier.border}`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${tier.badgeStyle || "bg-primary text-primary-foreground"}`}>
                    {tier.badge}
                  </div>
                )}
                {tier.glow && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
                )}
                <div className={`h-11 w-11 rounded-xl ${tier.bg} border ${tier.border} flex items-center justify-center mb-4 relative`}>
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
                  className="w-full mt-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground relative"
                  onClick={handleCTA}
                >
                  {tier.name === "AI Manager" && <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                  {tier.cta}
                </Button>
                {tier.subtext && <p className="text-center text-xs text-muted-foreground mt-2">{tier.subtext}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-20 border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Results</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">What happens when artists use SoundReady.</h2>
            <p className="text-lg text-muted-foreground">Not promises. Outcomes.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: "+200%", label: "Average revenue increase", sub: "Within 12 months using SoundReady's finance, pitching, and release tools." },
              { num: "+78%", label: "Increase in streams", sub: "For artists using release strategy and playlist pitching on every release." },
              { num: "+120%", label: "More shows booked", sub: "Versus artists sending cold emails manually." },
              { num: "10+ hrs", label: "Saved every week", sub: "By stopping manual playlist, outreach, royalty tracking, and release planning." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-card border border-primary/20 p-6 space-y-3 text-center">
                <p className="font-heading text-5xl font-black text-primary">{s.num}</p>
                <p className="font-heading font-bold text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Common Questions</p>
            <h2 className="font-heading text-4xl font-bold">Straight answers.</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl bg-card border border-border p-5 space-y-2">
                <p className="text-sm font-semibold text-foreground">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/8 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-8">
          <h2 className="font-heading text-5xl sm:text-6xl font-black leading-[0.95]">
            Your next release could be your biggest.<br />
            <span className="text-primary">SoundReady makes sure of it.</span>
          </h2>
          <p className="text-lg text-muted-foreground">The artists winning right now aren't more talented — they're more organized and more strategic. SoundReady gives you everything you need to be both, starting today.</p>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={handleCTA}>
            Start Building My Career <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">No contracts. No percentage cuts. No free tier — because serious artists deserve serious tools.</p>
        </motion.div>
      </section>
    </div>
  );
}