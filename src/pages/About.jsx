import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Flame, Zap, BarChart2, Music2, DollarSign, FileText, Users,
  CheckCircle2, Mic2, MapPin, BookOpen, Wand2, Link2, TrendingUp, Newspaper,
  Send, CalendarDays, AlertTriangle, Clock, PhoneOff, TrendingDown, Star,
  Bot, UserCheck, ChevronRight, Sparkles, Disc3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import SEO from "@/components/SEO";
import GrowthComparisonChart from "@/components/home/GrowthComparisonChart";
import CountUpStat from "@/components/home/CountUpStat";
import { useLang } from "@/lib/i18n/LanguageContext";

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
    tagline: "Your music's home base. Free forever.",
    price: "$0",
    desc: "You need a system before you need a team. Organize up to 5 songs in the Vault — or up to 5 beats in the Productions — and track every song from idea to release, free, forever. Everything else unlocks with Artist Pro.",
    items: [
      "Vault — up to 5 songs, organized",
      "Tracker — from idea to release",
      "Productions & Placements — up to 5 beats",
      "Connect Spotify & YouTube",
      "Your artist dashboard",
    ],
    cta: "Start",
    subtext: "Free forever. No card required.",
  },
  {
    icon: Users,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Artist Pro",
    tagline: "You and your team, finally in sync.",
    price: "$37/mo",
    badge: "Most Popular · 7-Day Free Trial",
    desc: "The full toolkit, unlocked. Book more shows, plan smarter tours, and bring your whole team into one workspace — and if you make beats, move them from idea to placement with the Beat Pipeline and Artist Match. 7 days free.",
    items: [
      "Everything in Artist, unlocked",
      "The Studio, Gig Finder & 843+ venue database",
      "Tour Planner, Tour Finance & Venue Contracts",
      "Beat Pipeline & Artist Match — producer tools",
      "The Wall — the artist community",
      "Invite your team — Team Chat & Whiteboard",
      "Career Roadmap & weekly music briefings",
    ],
    cta: "Start",
    route: "/pricing",
    subtext: "Card required — charged automatically after 7 days. Cancel anytime.",
  },
  {
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    name: "AI Manager",
    tagline: "Your career, worked around the clock.",
    price: "$60/mo",
    badge: "Sam Works For You",
    badgeStyle: "bg-primary text-primary-foreground",
    glow: true,
    desc: "Sam automatically outbounds on your behalf for opportunities weekly — tour support, features, sync opportunities and more. You simply approve or deny. Every move is drafted from your real numbers and waits for you in Sam's Desk.",
    items: [
      "Sam outbounds for you weekly — tour support, features, sync & more",
      "You simply approve or deny — nothing sends without you",
      "Sam chat backed by your real numbers",
      "Auto-drafted playlist & tour-opening pitches",
      "Sam pitches your beats to matching artists",
      "EPKs & weekly career digests",
    ],
    cta: "Start",
    route: "/pricing",
    subtext: "No percentage cuts — ever.",
  },
];

const WHAT_WE_DO = [
  { icon: Zap, color: "text-primary", title: "Release Strategy", desc: "Get a complete AI-powered release plan in 60 seconds, built around your actual audio data. Ideal timing, pitching timeline, algorithm outlook — no guesswork." },
  { icon: Mic2, color: "text-chart-3", title: "Playlist Pitching", desc: "Pitch to 40+ curated playlists with personalized outreach written around your song's sound and mood. More playlist adds means more streams and algorithmic momentum." },
  { icon: FileText, color: "text-purple-400", title: "Press & EPK", desc: "Generate a full Electronic Press Kit with bio, stats, and streaming links in minutes. The same professional presentation that gets artists into festivals and editorial — ready to send instantly." },
  { icon: MapPin, color: "text-orange-400", title: "Booking & Tours", desc: "Access 843+ venues, generate booking inquiries, plan your tour routing, and track every dollar of income and expenses. More shows, better margins, zero spreadsheets." },
  { icon: DollarSign, color: "text-chart-4", title: "Finance & Royalties", desc: "Upload royalty statements from every DSP and see exactly what you're earning in one place. Track expenses, send invoices, and finally understand your music business finances." },
  { icon: Send, color: "text-teal-400", title: "Distribution", desc: "Manage ISRC codes, metadata, pre-save links, and distributor submissions in one organized checklist. Every release goes out clean, professional, and ready to perform." },

  { icon: BarChart2, color: "text-chart-5", title: "A&R Intelligence", desc: "Weekly briefings on what's working in your genre right now — tempos, moods, and strategies getting editorial love. Make smarter decisions before you finish the song." },
  { icon: FileText, color: "text-yellow-400", title: "Contract Analyzer", desc: "Upload any deal or contract and SoundReady flags every clause that could hurt you — in plain English. Know exactly what you're signing before you sign it." },
  { icon: Disc3, color: "text-purple-400", title: "Productions & Placements", desc: "Producers get their own workspace. Catalog every beat with BPM, key, and moods, track your credits and fees, and turn your placement history into the resume that lands collabs." },
  { icon: UserCheck, color: "text-teal-400", title: "Artist Match", desc: "SoundReady ranks the artists on the platform whose sound fits your beats — and Sam drafts the pitch for you. Your beats stop waiting for artists to find you." },
  { icon: Bot, color: "text-primary", title: "Sam, Your AI Manager", desc: "Sam outbounds on your behalf every week — tour support, features, sync opportunities and more. You simply approve or deny, and nothing sends without you." },
  { icon: Users, color: "text-cyan-400", title: "Team Workspace", desc: "Bring your manager, producer, and engineer into one workspace — shared chat, whiteboards, and feedback on every version of the song. Your whole team in sync." },
];

export default function About() {
  const [isAuth, setIsAuth] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/dashboard";
    else window.location.href = "/pricing";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SoundReady — AI Career Management for Independent Artists & Producers"
        description="Your songs, your beats, your tours, your team — plus Sam, the AI manager that drafts your pitches and outreach from your real numbers. Start free."
      />

      <PublicNav showHome={false} />

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
            <Flame className="h-3.5 w-3.5" />
            {t("The Artist & Producer Management Revolution")}
          </motion.div>

          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            {t("Your career.")}<br />
            <span className="text-primary">{t("Finally moving.")}</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-body">
            {t("Release strategy, booking, touring, finances, and your team — the infrastructure signed acts get from a label, in one place, free to start. Grow into Artist Pro when you need the full toolkit, and hand the day-to-day work to Sam, your AI manager.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
              {t("Start")} <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="gap-2 font-heading font-bold text-base px-8 h-12">
                {t("See How It Works")}
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">{t("Start free. No contracts. No percentage cuts — ever.")}</p>
        </motion.div>
      </section>

      {/* THE PROBLEM — two types */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14 space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("Artists. Producers. One platform that ")}<span className="text-primary">{t("changes everything.")}</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              {
                headline: "You make beats.",
                body: "Your best beats are sitting in a folder while artists who'd pay for them never hear them. SoundReady gives producers the same infrastructure as artists — your Productions, a pipeline from idea to placement, and matching that puts your sound in front of the right artists.",
                label: "Turn beats into placements.",
                icon: Disc3,
              },
            ].map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 p-7 rounded-xl bg-secondary border border-border">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-heading font-bold text-xl">{t(card.headline)}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(card.body)}</p>
                <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold w-fit">{t(card.label)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MANAGER CALLOUT */}
      <section className="px-4 py-12 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-secondary border border-border px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="font-heading font-bold text-lg">{t("Already have a manager?")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("SoundReady is built for them too. Invite your team, share your workspace, and give your manager the infrastructure to actually move your career forward — faster than ever.")}</p>
            </div>
            <Button variant="outline" className="shrink-0 font-semibold" onClick={handleCTA}>
              {t("Invite Your Team")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* THE SOLUTION — 3 tiers */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Pricing")}</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("Start free. Grow when you're ready.")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("Your Vault and Tracker are free forever. Unlock the full toolkit with Artist Pro — or hand the work to Sam when your career is moving.")}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <motion.div key={tier.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-2xl border p-6 flex flex-col bg-card ${
                  tier.name === "AI Manager" ? "ring-2 ring-primary/60 shadow-2xl shadow-primary/10" :
                  tier.name === "Artist Pro" ? "ring-2 ring-chart-5/40 shadow-xl" : ""
                } ${tier.border}`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${tier.badgeStyle || "bg-primary text-primary-foreground"}`}>
                    {tier.badge}
                  </div>
                )}
                {tier.glow && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
                )}
                {tier.name === "AI Manager" && (
                  <motion.img
                    src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png"
                    alt="Sam, the SoundReady AI manager robot, grabbing the side of the AI Manager card"
                    className="pointer-events-none absolute -right-3 sm:-right-14 top-8 h-32 sm:h-44 w-auto drop-shadow-xl z-10"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
                  />
                )}
                <div className={`h-11 w-11 rounded-xl ${tier.bg} border ${tier.border} flex items-center justify-center mb-4 relative`}>
                  <tier.icon className={`h-5 w-5 ${tier.color}`} />
                </div>
                <p className="font-heading font-black text-2xl">{tier.name}</p>
                <p className={`text-sm font-semibold mt-0.5 mb-2 ${tier.color}`}>{t(tier.tagline)}</p>
                <p className="text-2xl font-black mb-3">{tier.price}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t(tier.desc)}</p>
                <div className="space-y-2 flex-1">
                  {tier.items.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${tier.color}`} />
                      <span className="text-xs text-foreground">{t(item)}</span>
                    </div>
                  ))}
                </div>
                {tier.route ? (
                  <Link to={tier.route}>
                    <Button className="w-full mt-6 font-semibold">
                      {tier.name === "AI Manager" && <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                      {t(tier.cta)}
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full mt-6 font-semibold" onClick={handleCTA}>
                    {t(tier.cta)}
                  </Button>
                )}
                {tier.subtext && <p className="text-center text-xs text-muted-foreground mt-2">{t(tier.subtext)}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("The Toolkit")}</p>
            <h2 className="font-heading text-4xl font-bold">{t("Everything a manager does. Nothing a manager doesn't.")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("Every tool was built to answer one question — what would a great manager do here? Then we built it into the platform so you never have to wonder.")}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_WE_DO.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl bg-card border border-border p-5 space-y-3 hover:border-primary/30 transition-colors">
                <f.icon className={`h-6 w-6 ${f.color}`} />
                <p className="font-heading font-bold text-sm">{t(f.title)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(f.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Who It's For")}</p>
            <h2 className="font-heading text-4xl font-bold">{t("Built for every artist who is serious about their career.")}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { level: "The Unsigned Artist", desc: "You're self-managing and the game feels rigged against you. SoundReady gives you the same tools, strategy, and infrastructure that signed artists get from their labels — from day one." },
              { level: "The Emerging Artist", desc: "You have momentum but your career isn't keeping up with your music. SoundReady organizes everything so every release works as hard as you do." },
              { level: "The Producer", desc: "Your beats are everywhere but your placements aren't. SoundReady gives you a real producer system — your Productions, a pipeline, a credits resume, and matching that puts your sound in front of the right artists." },
              { level: "The Manager or Indie Label", desc: "You're responsible for multiple artists and the disorganization is costing you real opportunities. SoundReady gives your whole team one place to work — every artist, every release, every deal, from a single platform." },
            ].map((w, i) => (
              <motion.div key={w.level}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border space-y-3">
                <div className="inline-flex px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold">{t(w.level)}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(w.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("The Toolkit")}</p>
            <h2 className="font-heading text-4xl font-bold">{t("The infrastructure of a full professional team.")}</h2>
            <p className="text-lg text-muted-foreground">{t("Real tools, real data, one login — not percentage-based management.")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: "843+", label: "Venues ready to pitch", sub: "A real booking database with venue details — generate inquiries and tour routing instead of cold-emailing blind." },
              { num: "40+", label: "Integrated tools", sub: "Release strategy, pitching, tours, royalties, contracts, and team workspace — a full professional team's toolkit in one place." },
              { num: "10+ hrs", label: "Back in your week", sub: "Stop manually managing playlists, venue outreach, royalty tracking, and release planning — the platform runs it." },
              { num: "$0", label: "To get started", sub: "Vault, Tracker, and Productions are free forever. Flat pricing after that — never a percentage of what you earn." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-card border border-primary/20 p-6 space-y-3 text-center">
                <CountUpStat value={s.num} />
                <p className="font-heading font-bold text-base">{t(s.label)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(s.sub)}</p>
              </motion.div>
            ))}
          </div>
          <GrowthComparisonChart />
          <p className="text-center text-xs text-muted-foreground">{t("Illustrative comparison, not a guarantee — results depend on your releases, effort, and genre.")}</p>
        </div>
      </section>

      {/* THE MATH */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {[
              { num: "15–20%", sub: "What the traditional management model takes — whether deals close or not" },
              { num: "$0", sub: "What it costs to start on SoundReady — core tools free forever" },
              { num: "40+", sub: "Integrated tools giving every artist and producer the infrastructure of a full professional team" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="space-y-2">
                <p className="font-heading text-3xl sm:text-5xl font-black text-primary">{s.num}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t(s.sub)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/8 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-5xl sm:text-6xl font-black">
              {t("Your next release could be your biggest.")}<br />
              <span className="text-primary">{t("SoundReady makes sure of it.")}</span>
            </h2>
            <p className="text-lg text-muted-foreground">{t("The artists and producers winning right now aren't more talented — they're more organized and more strategic. SoundReady gives you everything you need to be both, starting today.")}</p>
          </div>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-13" onClick={handleCTA}>
            {t("Start")} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">{t("Start free. No contracts. No percentage cuts — ever.")}</p>
        </motion.div>
      </section>
    </div>
  );
}