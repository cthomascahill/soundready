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
import PlatformShowcaseSection from "@/components/home/PlatformShowcaseSection";
import MattCormanSection from "@/components/home/MattCormanSection";
import HeroArtistSearch from "@/components/home/HeroArtistSearch";
import SamWalkthrough from "@/components/home/SamWalkthrough";
import ForYouIfSection from "@/components/home/ForYouIfSection";
import FaqSection from "@/components/home/FaqSection";
import { useLang } from "@/lib/i18n/LanguageContext";

const TIERS = [
  {
    icon: Zap,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Free",
    tagline: "Get your music organized.",
    limit: "Up to 5 songs",
    price: "$0 — Free forever",
    desc: "Keep your songs and releases in one place.",
    items: [
      "Store up to 5 songs in your Vault",
      "Track songs from idea to release",
      "Connect Spotify and YouTube to your artist profile",
      "Streaming royalty calculator",
      "Music Academy: learn the business of music",
    ],
    cta: "Start Free",
    checkout: "/checkout/free",
    subtext: "No card required.",
  },
  {
    icon: Users,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Artist Pro",
    tagline: "Tools to manage it yourself.",
    limit: "Unlimited songs",
    price: "$39/month",
    badge: "7-Day Free Trial",
    desc: "Plan releases, find opportunities, and work with your team in one workspace.",
    items: [
      "Everything in Free, unlocked",
      "Unlimited songs in your Vault",
      "Release planning and career tools",
      "Playlist discovery and venue search",
      "Tour planning, finances, and contracts",
      "Team chat and collaboration",
      "Studio: write and sketch with your beats",
    ],
    cta: "Start Pro",
    checkout: "/checkout/artist-pro",
    subtext: "Card required. $39/month after 7 days unless canceled.",
  },
  {
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    name: "Digital Manager",
    tagline: "For artists who want help doing the work.",
    limit: "2,500 SAM credits/mo",
    price: "$59/month",
    strike: "$79/month",
    founding: true,
    badge: "Founding Artist Offer",
    badgeStyle: "bg-primary text-primary-foreground",
    glow: true,
    desc: "SAM uses your music, stats, and goals to research opportunities and prepare personalized pitches. You stay in control.",
    items: [
      "Everything in Artist Pro",
      "Ask SAM to research venues, playlists, labels, press, and sync opportunities",
      "Get personalized outreach drafts ready to review",
      "Approve, edit, or deny pitches. SAM sends supported emails after approval",
      "Nothing sends without your approval",
      "Weekly career recommendations and digests",
      "Analyze attached files and reports",
      "Build on saved preferences and track outreach outcomes",
    ],
    cta: "Start Digital Manager",
    checkout: "/checkout/ai-manager",
    subtext: "No percentage cuts. Cancel anytime. Founding price stays locked while subscribed.",
    smallPrint: "Includes 2,500 SAM credits each month, shared across all SAM features. One credit covers one piece of SAM's work, like a venue search or a playlist pitch. Add 1,500 extra credits anytime for $15. They never expire. Some opportunities require manual submission.",
  },
];

export default function About() {
  const [isAuth, setIsAuth] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/history";
    else window.location.href = "/register";
  };


  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SoundReady: Your Digital Music Manager for Independent Artists"
        description="Your songs, your tours, your team, plus SAM, your digital music manager that drafts your pitches and outreach from your real numbers. Start free."
      />

      <PublicNav showHome={false} />

      {/* HERO */}
      <section className="relative px-4 pt-24 pb-14 text-center overflow-hidden">
        {/* Soft ambient glows, Too Lost style: oversized blurred color fields behind the hero */}
        <div className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
        <div className="absolute -top-40 -right-56 h-[560px] w-[560px] rounded-full bg-chart-2/10 blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] items-center gap-6">
          {/* Hero copy */}
          <div className="space-y-4 lg:space-y-5 text-center">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[0.9]">
              {t("Your own digital")}<br />
              <span className="text-primary">{t("music manager")}</span>
            </h1>
            <p className="font-heading text-lg sm:text-xl font-bold tracking-tight">
              {t("Stop doing everything alone.")}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t("SAM finds music opportunities, drafts your pitches, and helps plan your next release. You approve what goes out.")}
            </p>

            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <p className="font-heading text-xl sm:text-2xl lg:text-4xl font-black text-foreground tracking-tight">
                {t("Search your artist name now")}
              </p>
              <ArrowDown className="h-4 w-4 sm:h-6 sm:w-6 text-foreground animate-bounce" />
            </div>

            <HeroArtistSearch />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Button size="lg" className="gap-2 font-heading font-bold text-sm sm:text-base px-6 sm:px-8 h-12" onClick={handleCTA}>
                {t("Start Free")}
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">{t("Free workspace. SAM plans from $59/month.")}</p>
          </div>

          {/* SAM mascot, big on the right, floating */}
          <div className="relative flex flex-col items-center justify-center lg:items-end pt-8 lg:pt-0">
            <motion.img
              src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/cbca442cd_generated_76ab93fb.png"
              alt="SAM, the Soundready Artist Manager robot"
              className="h-52 sm:h-72 lg:h-[360px] w-auto drop-shadow-[0_24px_60px_rgba(34,197,94,0.25)]"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0, y: [0, -14, 0] }}
              transition={{
                opacity: { duration: 0.6 },
                x: { duration: 0.6 },
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
            />
            <p className="mt-2 font-heading text-lg sm:text-2xl font-black tracking-tight text-foreground whitespace-nowrap">
              <span className="text-primary">S</span>oundready&nbsp;<span className="text-primary">A</span>rtist&nbsp;<span className="text-primary">M</span>anager
            </p>
            <div className="absolute -top-2 lg:top-6 -left-2 lg:left-auto lg:right-52 -rotate-6 flex flex-col items-center pointer-events-none z-20">
              <p className="font-heading text-2xl sm:text-4xl font-black text-foreground whitespace-nowrap">{t("Meet SAM")}</p>
              <svg width="110" height="80" viewBox="-11 0 110 80" fill="none" className="text-primary mt-1 w-[90px] h-auto sm:w-[110px] sm:h-[80px]">
                <path d="M4 6 C 44 10, 76 30, 82 66" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <path d="M68 62 L 84 74 L 76 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </motion.div>

      </section>

      {/* MEET SAM: one step-by-step walkthrough, two example tasks */}
      <SamWalkthrough />

      {/* PROOF: built by an independent artist, right after the SAM demo */}
      <MattCormanSection />

      {/* AUDIENCE: artist identification and transformation */}
      <ForYouIfSection />

      {/* THE PLATFORM: compact product screenshots */}
      <PlatformShowcaseSection />

      {/* PRICING, 3 tiers */}
      <section id="pricing" className="relative px-4 py-16 overflow-hidden scroll-mt-20">
        {/* Soft ambient gradient glows, mirrored to the opposing side from the showcase above */}
        <div className="absolute -top-48 -right-56 h-[620px] w-[620px] rounded-full bg-primary/15 blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-64 h-[560px] w-[560px] rounded-full bg-chart-2/10 blur-[160px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto space-y-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Pricing")}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <div className="relative h-full">
                <div className={`absolute -inset-4 rounded-3xl blur-3xl pointer-events-none ${
                  tier.name === "Digital Manager" ? "bg-primary/25" : tier.name === "Artist Pro" ? "bg-chart-5/20" : "bg-chart-2/15"
                }`} />
                <motion.div key={tier.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative h-full rounded-2xl border p-4 sm:p-6 flex flex-col bg-card ${
                  tier.name === "Digital Manager" ? "ring-2 ring-primary/60 shadow-2xl shadow-primary/10" :
                  tier.name === "Artist Pro" ? "ring-2 ring-chart-5/40 shadow-xl" : ""
                } ${tier.border}`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${tier.badgeStyle || "bg-primary text-primary-foreground"}`}>
                    {tier.badge}
                  </div>
                )}
                {tier.glow && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
                )}
                {tier.name === "Digital Manager" && (
                  <motion.img
                    src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png"
                    alt="SAM, the Soundready Artist Manager robot pointing at the Digital Manager card"
                    className="pointer-events-none absolute -right-3 xl:-right-14 top-8 h-24 sm:h-44 w-auto drop-shadow-xl z-10"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
                  />
                )}
                <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl ${tier.bg} border ${tier.border} flex items-center justify-center mb-3 lg:mb-4 relative`}>
                  <tier.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${tier.color}`} />
                </div>
                <p className="font-heading font-black text-lg sm:text-2xl">{tier.name}</p>
                <p className={`text-xs sm:text-sm font-semibold mt-0.5 mb-2 ${tier.color}`}>{t(tier.tagline)}</p>
                <div className="flex items-baseline gap-2 flex-wrap mb-3">
                  {tier.strike && <span className="text-xs sm:text-sm text-muted-foreground line-through font-semibold">{tier.strike}</span>}
                  <p className="text-xl sm:text-2xl font-black">{tier.price}</p>
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground">· {t(tier.limit)}</span>
                  {tier.founding && <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] lg:text-[10px] font-bold uppercase tracking-wide">First 100 Artists · Discounted Forever</span>}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-snug lg:leading-relaxed mb-4 lg:mb-5">{t(tier.desc)}</p>
                <div className="space-y-1.5 lg:space-y-2 flex-1">
                  {tier.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 lg:gap-2.5">
                      <CheckCircle2 className={`h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0 mt-0.5 ${tier.color}`} />
                      <span className="text-xs sm:text-sm text-foreground">{t(item)}</span>
                    </div>
                  ))}
                </div>
                <Link to={tier.checkout}>
                  <Button className="w-full mt-4 lg:mt-6 font-semibold text-xs sm:text-sm px-3 lg:px-4">
                    {tier.name === "Digital Manager" && <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                    {t(tier.cta)}
                  </Button>
                </Link>
                {tier.subtext && <p className="text-center text-[10px] sm:text-sm text-muted-foreground mt-2 leading-snug">{t(tier.subtext)}</p>}
                {tier.smallPrint && <p className="text-center text-[9px] lg:text-xs text-muted-foreground mt-1 leading-relaxed">{t(tier.smallPrint)}</p>}
              </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* SOCIAL PROOF STATS */}
      <section className="px-4 py-14">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <h2 className="font-heading text-4xl font-bold">{t("See what's possible with SoundReady")}</h2>
          </motion.div>
          {showScenarios ? (
            <div className="space-y-6">
              <GrowthComparisonChart />
              <p className="text-center text-sm text-muted-foreground">{t("Illustrative comparison, not a guarantee, results depend on your releases, effort, and genre.")}</p>
              <div className="flex justify-center">
                <Button variant="outline" className="h-12 px-8 font-heading font-bold" onClick={() => setShowScenarios(false)}>
                  {t("Hide scenarios")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button variant="outline" className="h-12 px-8 gap-2 font-heading font-bold" onClick={() => setShowScenarios(true)}>
                {t("Compare growth scenarios")} <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
            {[
              { num: "1,341+", label: "venues ready to pitch" },
              { num: "30", label: "integrated tools" },
              { num: "10+ hrs", label: "back in your week" },
              { num: "$0", label: "to get started" },
              { num: "15–20%", label: "traditional management takes" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-4 sm:p-6 space-y-1.5 sm:space-y-2 text-center">
                <p className="font-heading text-xl sm:text-3xl lg:text-4xl font-black text-primary">{s.num}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{t(s.label)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center bg-gradient-to-t from-primary/8 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              {t("Your music deserves ")}<span className="text-primary">{t("more than guesswork")}</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t("You've already put the work into making the music. Now it's time to build the career around it.")}
            </p>
          </div>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
            {t("Get Your Digital Music Manager")} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("Start free. No contracts. No percentage cuts, ever.")}</p>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}