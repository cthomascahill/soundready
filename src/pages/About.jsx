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
  { icon: DollarSign, text: "The traditional model takes 15–20% of everything you earn — whether deals close or not" },
  { icon: AlertTriangle, text: "Most artists have no system — no strategy, no visibility, no plan" },
  { icon: Clock, text: "Releases happen without a real strategy and wonder why nothing moves" },
  { icon: TrendingDown, text: "Opportunities get missed because there's no infrastructure to catch them" },
  { icon: FileText, text: "Bad contracts get signed because there's no one reviewing the fine print" },
  { icon: PhoneOff, text: "Teams fall out of sync and releases get disorganized at the worst moment" },
];

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
    desc: "Everything in Pro, built for indie labels and managers running multiple artists. Unlimited songs, unlimited team members, multiple artist profiles — all under one login.",
    items: [
      "Everything in Pro",
      "Unlimited team members",
      "Unlimited song library",
      "Multiple artist profiles under one account",
      "Dedicated onboarding support",
      "First access to new features",
    ],
    cta: "Apply Now",
    subtext: "We'll do a quick 15-min call to get your roster set up correctly. It's worth it.",
  },
];

const WHAT_WE_DO = [
  { icon: Zap, color: "text-primary", title: "Release Strategy", desc: "Get a complete AI-powered release plan in 60 seconds, built around your actual audio data. Ideal timing, pitching timeline, algorithm outlook — no guesswork." },
  { icon: Mic2, color: "text-chart-3", title: "Playlist Pitching", desc: "Pitch to 40+ curated playlists with personalized outreach written around your song's sound and mood. More playlist adds means more streams and algorithmic momentum." },
  { icon: FileText, color: "text-purple-400", title: "Press & EPK", desc: "Generate a full Electronic Press Kit with bio, stats, and streaming links in minutes. The same professional presentation that gets artists into festivals and editorial — ready to send instantly." },
  { icon: MapPin, color: "text-orange-400", title: "Booking & Tours", desc: "Access 200+ venues, generate booking inquiries, plan your tour routing, and track every dollar of income and expenses. More shows, better margins, zero spreadsheets." },
  { icon: DollarSign, color: "text-chart-4", title: "Finance & Royalties", desc: "Upload royalty statements from every DSP and see exactly what you're earning in one place. Track expenses, send invoices, and finally understand your music business finances." },
  { icon: Send, color: "text-teal-400", title: "Distribution", desc: "Manage ISRC codes, metadata, pre-save links, and distributor submissions in one organized checklist. Every release goes out clean, professional, and ready to perform." },
  { icon: Music2, color: "text-[#1DB954]", title: "Sync Licensing", desc: "Surface sync opportunities for TV, film, games, and commercials — SoundReady writes the pitch for you. One sync placement can change your financial year." },
  { icon: Wand2, color: "text-cyan-400", title: "AI Mastering", desc: "Upload your track and get a professionally mastered WAV back with -14 LUFS normalization. Sounds like you paid $200 for it. Costs nothing extra." },
  { icon: BarChart2, color: "text-chart-5", title: "A&R Intelligence", desc: "Weekly briefings on what's working in your genre right now — tempos, moods, and strategies getting editorial love. Make smarter decisions before you finish the song." },
  { icon: FileText, color: "text-yellow-400", title: "Contract Analyzer", desc: "Upload any deal or contract and SoundReady flags every clause that could hurt you — in plain English. Know exactly what you're signing before you sign it." },
  { icon: Users, color: "text-pink-400", title: "Fan Intelligence", desc: "Understand where your real fans are, when they listen, and what they want. Use that data to tour smarter and make every release decision with real information." },
  { icon: TrendingUp, color: "text-teal-400", title: "Release Radar", desc: "Track comparable artists and know exactly when they're moving. Time your releases to stand out instead of getting buried." },
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
            Your career.<br />
            <span className="text-primary">Finally moving.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-body">
            SoundReady gives independent artists the exact same tools, strategy, and infrastructure that signed artists get from their label — for $37 a month. More streams. More playlists. More shows. More money. No manager required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
              Start Building My Career <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="gap-2 font-heading font-bold text-base px-8 h-12">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">No contracts. No percentage cuts. No free tier — because serious artists deserve serious tools.</p>
        </motion.div>
      </section>

      {/* THE PROBLEM — two types */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14 space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">Two types of artists. One platform that changes everything.</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                headline: "You have a manager.",
                body: "Your team needs one place to work from. SoundReady gives your manager the tools to move faster, pitch smarter, and keep your whole career organized — so nothing falls through the cracks.",
                label: "Give your team the edge.",
                icon: Users,
              },
              {
                headline: "You don't have a manager.",
                body: "You're making real music but your career isn't moving. The artists winning right now aren't more talented — they're better organized. SoundReady is the infrastructure that turns a good artist into a growing one.",
                label: "Start moving forward.",
                icon: TrendingUp,
              },
            ].map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 p-7 rounded-xl bg-destructive/5 border border-destructive/15">
                <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <card.icon className="h-4 w-4 text-destructive" />
                </div>
                <p className="font-heading font-bold text-xl">{card.headline}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold w-fit">{card.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MANAGER CALLOUT */}
      <section className="px-4 py-12 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-primary/5 border border-primary/20 px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="font-heading font-bold text-lg">Already have a manager?</p>
              <p className="text-sm text-muted-foreground leading-relaxed">SoundReady is built for them too. Invite your team, share your workspace, and give your manager the infrastructure to actually move your career forward — faster than ever.</p>
            </div>
            <Button variant="outline" className="shrink-0 font-semibold" onClick={handleCTA}>
              Invite Your Team
            </Button>
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
                {tier.subtext && <p className="text-center text-xs text-muted-foreground mt-2">{tier.subtext}</p>}
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every tool was built to answer one question — what would a great manager do here? Then we built it into the platform so you never have to wonder.</p>
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
            <h2 className="font-heading text-4xl font-bold">Built for every artist who is serious about their career.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { level: "The Unsigned Artist", desc: "You're self-managing and the game feels rigged against you. SoundReady gives you the same tools, strategy, and infrastructure that signed artists get from their labels — from day one." },
              { level: "The Emerging Artist", desc: "You have momentum but your career isn't keeping up with your music. SoundReady organizes everything so every release works as hard as you do." },
              { level: "The Manager or Indie Label", desc: "You're responsible for multiple artists and the disorganization is costing you real opportunities. SoundReady gives your whole team one place to work — every artist, every release, every deal, from a single platform." },
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
            <h2 className="font-heading text-4xl font-bold">This is what happens when artists use SoundReady.</h2>
            <p className="text-lg text-muted-foreground">Not promises. Outcomes.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: "+200%", label: "Average increase in music revenue", sub: "Average revenue increase within 12 months using SoundReady's finance, pitching, and release tools." },
              { num: "+78%", label: "Increase in streams", sub: "Stream increase for artists using SoundReady's release strategy and playlist pitching on every release." },
              { num: "+120%", label: "More shows booked", sub: "More shows booked versus artists sending cold emails manually." },
              { num: "10+ hrs", label: "Saved every week", sub: "Saved weekly by artists who stop manually managing playlists, venue outreach, royalty tracking, and release planning." },
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
              { num: "15–20%", sub: "What the traditional management model takes — whether deals close or not" },
              { num: "$37/mo", sub: "Starting price for SoundReady — all tools included" },
              { num: "25+", sub: "Integrated tools giving every artist the infrastructure of a full professional team" },
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
              Your next release could be your biggest.<br />
              <span className="text-primary">SoundReady makes sure of it.</span>
            </h2>
            <p className="text-lg text-muted-foreground">The artists winning right now aren't more talented — they're more organized and more strategic. SoundReady gives you everything you need to be both, starting today.</p>
          </div>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-13" onClick={handleCTA}>
            Start Building My Career <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">No contracts. No percentage cuts. No free tier — because serious artists deserve serious tools.</p>
        </motion.div>
      </section>
    </div>
  );
}