import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Flame, Zap, BarChart2, Music2, DollarSign, FileText, Users,
  CheckCircle2, Mic2, MapPin, BookOpen, Wand2, Link2, TrendingUp, Newspaper,
  Send, CalendarDays, AlertTriangle, Clock, PhoneOff, TrendingDown, Star, ArrowDown,
  Bot, ChevronRight, Sparkles, Radar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import SEO from "@/components/SEO";
import GrowthComparisonChart from "@/components/home/GrowthComparisonChart";
import CountUpStat from "@/components/home/CountUpStat";
import CareerWorkflowSection from "@/components/home/CareerWorkflowSection";
import SamInActionSection from "@/components/home/SamInActionSection";
import MattCormanSection from "@/components/home/MattCormanSection";
import HeroArtistSearch from "@/components/home/HeroArtistSearch";
import IncludedSection from "@/components/home/IncludedSection";
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
      "Vault: up to 5 songs",
      "Tracker: idea to release",
      "Connect Spotify & YouTube",
    ],
    cta: "Start Free",
    checkout: "/checkout/free",
    subtext: "Free forever. No card required.",
  },
  {
    icon: Users,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Artist Pro",
    tagline: "You and your team, finally in sync.",
    price: "$39/mo",
    badge: "7-Day Free Trial",
    desc: "Every tool unlocked, plus your whole team in one workspace. 7 days free.",
    items: [
      "Everything in Free, unlocked",
      "Playlist Pitcher, Deals & Music News",
      "Gig Finder & 1,341+ venues",
      "Tour Planner, Finance & Contracts",
      "The Wall: artist community",
      "Team Chat & shared Whiteboard",
    ],
    cta: "Start Pro",
    checkout: "/checkout/artist-pro",
    subtext: "Card required, charged automatically after 7 days. Cancel anytime.",
  },
  {
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    name: "AI Manager",
    tagline: "Your career, worked around the clock.",
    price: "$59/mo",
    strike: "$79/mo",
    founding: true,
    badge: "Most Popular · SAM Works For You",
    badgeStyle: "bg-primary text-primary-foreground",
    glow: true,
    desc: "SAM finds opportunities and writes pitches for you every week: tour support, features, sync and more. You approve or deny. Nothing sends without you.",
    items: [
      "SAM finds opportunities and writes pitches weekly, you approve or deny",
      "Contract Analyzer: SAM reads any contract",
      "Opportunities, A&R Intel & Career Roadmap",
      "Tell SAM, This Week & SAM's Desk",
    ],
    cta: "Start AI Manager",
    checkout: "/checkout/ai-manager",
    subtext: "No percentage cuts, ever.",
  },


];

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
        title="SoundReady: AI Career Management for Independent Artists"
        description="Your songs, your tours, your team, plus SAM, the AI manager that drafts your pitches and outreach from your real numbers. Start free."
      />

      <PublicNav showHome={false} />

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-5xl mx-auto space-y-8">
          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            {t("Your own AI")}<br />
            <span className="text-primary">{t("music manager")}</span>
          </h1>

          <div className="flex flex-col items-center gap-2">
            <p className="font-heading text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              {t("Search your artist name now")}
            </p>
            <ArrowDown className="h-7 w-7 text-foreground animate-bounce mt-2" />
          </div>

          <HeroArtistSearch />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
              {t("Start")} <ArrowRight className="h-4 w-4" />
            </Button>
            <a href="#sam-in-action">
              <Button size="lg" variant="outline" className="gap-2 font-heading font-bold text-base px-8 h-12">
                {t("See How SAM Works")}
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground">{t("Start free. No contracts. No percentage cuts, ever.")}</p>
        </motion.div>

      </section>

      {/* SAM IN ACTION */}
      <SamInActionSection />

      {/* CREATED BY MATT CORMAN */}
      <MattCormanSection />

      {/* THE WEEKLY LOOP */}
      <CareerWorkflowSection />

      <IncludedSection />

      {/* PRICING, 3 tiers */}
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
                    alt="SAM, the SoundReady AI manager robot, grabbing the side of the AI Manager card"
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
                <div className="flex items-baseline gap-2 flex-wrap mb-3">
                  {tier.strike && <span className="text-sm text-muted-foreground line-through font-semibold">{tier.strike}</span>}
                  <p className="text-2xl font-black">{tier.price}</p>
                  {tier.founding && <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wide">First 100 Artists · Discounted Forever</span>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t(tier.desc)}</p>
                <div className="space-y-2 flex-1">
                  {tier.items.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${tier.color}`} />
                      <span className="text-sm text-foreground">{t(item)}</span>
                    </div>
                  ))}
                </div>
                <Link to={tier.checkout}>
                  <Button className="w-full mt-6 font-semibold">
                    {tier.name === "AI Manager" && <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                    {t(tier.cta)}
                  </Button>
                </Link>
                {tier.subtext && <p className="text-center text-sm text-muted-foreground mt-2">{t(tier.subtext)}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <h2 className="font-heading text-4xl font-bold">{t("See what's possible with SoundReady")}</h2>
          </motion.div>
          <GrowthComparisonChart />
          <p className="text-center text-sm text-muted-foreground">{t("Illustrative comparison, not a guarantee, results depend on your releases, effort, and genre.")}</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "1,341+", label: "venues ready to pitch" },
              { num: "24", label: "integrated tools" },
              { num: "10+ hrs", label: "back in your week" },
              { num: "$0", label: "to get started" },
              { num: "15–20%", label: "traditional management takes" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-primary/20 p-6 space-y-2 text-center">
                <p className="font-heading text-3xl sm:text-4xl font-black text-primary">{s.num}</p>
                <p className="text-sm text-muted-foreground">{t(s.label)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/8 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-5xl sm:text-6xl font-black lg:whitespace-nowrap">
              {t("Your biggest release ")}<span className="text-primary">{t("is next")}</span>
            </h2>
          </div>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-13" onClick={handleCTA}>
            {t("Start")} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">{t("Start free. No contracts. No percentage cuts, ever.")}</p>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}