import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Flame, Zap, BarChart2, Music2, DollarSign, FileText, Users,
  CheckCircle2, Mic2, MapPin, BookOpen, Wand2, Link2, TrendingUp, Newspaper,
  Send, CalendarDays, AlertTriangle, Clock, PhoneOff, TrendingDown, Star,
  Bot, ChevronRight, Sparkles, Radar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import SEO from "@/components/SEO";
import GrowthComparisonChart from "@/components/home/GrowthComparisonChart";
import CountUpStat from "@/components/home/CountUpStat";
import CareerWorkflowSection from "@/components/home/CareerWorkflowSection";
import SamInActionSection from "@/components/home/SamInActionSection";
import { TOOL_CATEGORIES } from "@/lib/toolCatalog";
import { useLang } from "@/lib/i18n/LanguageContext";

const TIERS = [
  {
    icon: Zap,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Free",
    tagline: "Your music's home base. Free forever.",
    price: "$0",
    desc: "Your music's home base. Up to 5 songs, fully organized, free forever.",
    items: [
      "Vault — up to 5 songs",
      "Tracker — idea to release",
      "Connect Spotify & YouTube",
    ],
    cta: "Start Free",
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
    badge: "7-Day Free Trial",
    desc: "Every tool unlocked, plus your whole team in one workspace. 7 days free.",
    items: [
      "Everything in Free, unlocked",
      "Gig Finder & 843+ venues",
      "Tour Planner, Finance & Contracts",
      "The Wall — artist community",
      "Team Chat & Career Roadmap",
    ],
    cta: "Start Pro",
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
    badge: "Most Popular · Sam Works For You",
    badgeStyle: "bg-primary text-primary-foreground",
    glow: true,
    desc: "Sam outbounds for you every week — tour support, features, sync and more. You approve or deny. Nothing sends without you.",
    items: [
      "Sam outbounds weekly — you approve or deny",
      "Playlist & tour pitches, drafted for you",
      "Sam chat backed by your real numbers",
      "EPKs & weekly digests",
    ],
    cta: "Start AI Manager",
    route: "/pricing",
    subtext: "No percentage cuts — ever.",
  },


];

// Every tool on the platform, straight from the app's tool catalog
const ALL_TOOLS = TOOL_CATEGORIES.flatMap((c) => c.tools);

export default function About() {
  const [isAuth, setIsAuth] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/history";
    else window.location.href = "/pricing";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SoundReady — AI Career Management for Independent Artists"
        description="Your songs, your tours, your team — plus Sam, the AI manager that drafts your pitches and outreach from your real numbers. Start free."
      />

      <PublicNav showHome={false} />

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
            <Bot className="h-3.5 w-3.5" />
            {t("One home base. One AI manager.")}
          </motion.div>

          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            {t("Your career,")}<br />
            <span className="text-primary">{t("in motion.")}</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-body">
            {t("Every song, show, deal and dollar in one place — plus Sam, your AI manager, working your career every week. You approve or deny. Start free.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
              {t("Start")} <ArrowRight className="h-4 w-4" />
            </Button>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="gap-2 font-heading font-bold text-base px-8 h-12">
                {t("How It Works")}
              </Button>
            </a>
          </div>

          <p className="text-xs text-muted-foreground">{t("Start free. No contracts. No percentage cuts — ever.")}</p>
        </motion.div>

      </section>

      {/* SAM SPOTLIGHT — the main event */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 order-2 lg:order-1">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("AI Manager")}</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("Meet Sam.")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("Sam is your AI manager. Sam automatically finds opportunities and pitches you for them every week — real outbound, from your real numbers, waiting for your approval. Just log in, approve or deny.")}
            </p>
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
              {t("Get Sam — $60/mo")} <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">{t("No percentage cuts — ever. Everything on this page comes with it.")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative order-1 lg:order-2 flex justify-center">
            <motion.img
              src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png"
              alt="Sam, the SoundReady AI manager robot"
              className="h-64 sm:h-80 w-auto drop-shadow-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
            />
          </motion.div>
        </div>
      </section>

      {/* SAM IN ACTION */}
      <SamInActionSection />

      {/* THE WEEKLY LOOP */}
      <CareerWorkflowSection />

      {/* THE SOLUTION — 3 tiers */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Pricing")}</p>
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
                    className="pointer-events-none absolute -right-3 xl:-right-14 top-8 h-32 sm:h-44 w-auto drop-shadow-xl z-10"
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

      {/* THE TOOLKIT */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <h2 className="font-heading text-4xl font-bold">{t("The Toolkit")}</h2>
            <p className="text-lg text-muted-foreground">{t("Every tool. One login.")}</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALL_TOOLS.map((tool, i) => (
              <motion.div key={tool.name}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className="rounded-xl bg-card border border-border p-4 space-y-2 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <tool.icon className="h-4 w-4 shrink-0 text-primary" />
                  <p className="font-heading font-bold text-sm truncate">{t(tool.name)}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(tool.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <h2 className="font-heading text-4xl font-bold">{t("The infrastructure of a full professional team.")}</h2>
          </motion.div>
          <GrowthComparisonChart />
          <p className="text-center text-xs text-muted-foreground">{t("Illustrative comparison, not a guarantee — results depend on your releases, effort, and genre.")}</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "843+", label: "venues ready to pitch" },
              { num: "40+", label: "integrated tools" },
              { num: "10+ hrs", label: "back in your week" },
              { num: "$0", label: "to get started" },
              { num: "15–20%", label: "traditional management takes" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-primary/20 p-6 space-y-2 text-center">
                <p className="font-heading text-3xl sm:text-4xl font-black text-primary">{s.num}</p>
                <p className="text-xs text-muted-foreground">{t(s.label)}</p>
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