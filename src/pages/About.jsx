import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bot, CheckCircle2, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import SEO from "@/components/SEO";

import MeetSamSection from "@/components/home/MeetSamSection";
import MattCormanSection from "@/components/home/MattCormanSection";
import HeroArtistSearch from "@/components/home/HeroArtistSearch";
import VslSection from "@/components/home/VslSection";
import VsRestSection from "@/components/home/VsRestSection";
import WithWithoutSection from "@/components/home/WithWithoutSection";
import FiveMinuteSection from "@/components/home/FiveMinuteSection";
import FaqSection from "@/components/home/FaqSection";
import { useLang } from "@/lib/i18n/LanguageContext";

// Plans: prices, limits, trial conditions and checkout destinations are unchanged.
// Only the framing changes, the workspace is the product; SAM lives inside it.
const TIERS = [
  {
    icon: Zap,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    name: "Free",
    tagline: "Your next three songs, free.",
    limit: "Up to 3 songs",
    price: "$0, free forever",
    desc: "Sign up free and your Release Starter Kit lands in your inbox the moment you join: Spotify editorial playlist pitch template, filled-in example, release timeline, metadata checklist.",
    items: [
      "Store up to 3 songs in your Vault",
      "Track songs from idea to release",
      "Connect Spotify and YouTube to your artist profile",
      "Streaming royalty calculator",
      "Spotify editorial playlist pitch template: the same exact template used to get on thousands of Spotify editorial playlists, for free",
      "Release checklist",
      "Music Academy: a step-by-step guide on how to create and scale your music business",
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
    tagline: "Your full music workspace.",
    limit: "Unlimited songs",
    price: "$9.99/month",
    strike: "$49/month",
    founding: true,
    badge: "Early Bird Special",
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
    subtext: "Card required. $9.99/month. Early bird, on sale from $49/month.",
  },
  {
    icon: Bot,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    name: "Digital Manager",
    tagline: "A team behind your releases.",
    limit: "2,500 SAM credits/mo",
    price: "$24.99/month",
    strike: "$89/month",
    founding: true,
    badge: "Early Bird Special",
    badgeStyle: "bg-primary text-primary-foreground",
    glow: true,
    desc: "You get your music workspace, personalized release plans, promotion targets that fit your sound, pitches ready to approve, and outreach tracking. SAM works from your music, stats, and goals, and you approve every email before it's sent.",
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
    subtext: "No percentage cuts. Cancel anytime. Early bird price stays locked while subscribed.",
    smallPrint: "Includes 2,500 SAM credits each month: in a real month that covers about 10 research tasks, 30 personalized pitch drafts, 4 weekly digests, 30 daily intel briefs and an EPK refresh, with credits to spare. Add 1,500 extra credits anytime for $15. They never expire. Some opportunities require manual submission.",
  },
];

export default function About() {
  const [isAuth, setIsAuth] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleCTA = () => {
    if (isAuth) window.location.href = "/dashboard";
    else window.location.href = "/register";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SoundReady: Your Music Workspace for Independent Artists"
        description="SoundReady keeps your songs, mixes, feedback, and release progress together in one workspace, with SAM, an AI manager, to help you take the next step. Start free."
      />

      <PublicNav showHome={false} />

      {/* HERO: your career in motion, SAM big right beside it */}
      <section className="relative px-4 pt-24 pb-16 overflow-hidden">
        {/* Soft ambient glows behind the hero */}
        <div className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
        <div className="absolute -top-40 -right-56 h-[560px] w-[560px] rounded-full bg-chart-2/10 blur-[160px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 xl:gap-20 items-center">
          {/* Left: the offer and the artist search */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center lg:text-left">
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
              {t("Your music")}<br />
              <span className="text-primary">{t("in motion")}</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t("Keep your songs and mixes together, prepare your releases, and let SAM find opportunities and handle outreach with your approval.")}
            </p>
            <div>
              <Button size="lg" className="gap-2 font-heading font-bold text-sm sm:text-base px-6 sm:px-8 h-12" onClick={handleCTA}>
                {t("Start Free")}
              </Button>
            </div>
            <div className="pt-2">
              <HeroArtistSearch />
            </div>
          </motion.div>

          {/* Right: SAM, big, right next to the copy */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <motion.img
              src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png"
              alt="SAM, your SoundReady Artist Manager"
              className="h-[300px] sm:h-[400px] lg:h-[440px] xl:h-[520px] w-auto drop-shadow-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            <div className="rounded-xl border border-primary/30 bg-card px-4 py-2.5 shadow-xl text-center">
              <p className="text-sm font-bold text-primary">Meet SAM</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-bold">S</span>oundReady{" "}
                <span className="text-primary font-bold">A</span>rtist{" "}
                <span className="text-primary font-bold">M</span>anager
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THE VSL: one artist's whole journey, right after Start Free */}
      <VslSection />

      {/* WITHOUT SOUNDREADY VS. WITH SOUNDREADY */}
      <WithWithoutSection />

      {/* FOUNDER STORY */}
      <MattCormanSection />

      {/* IN JUST 5 MINUTES */}
      <FiveMinuteSection />

      {/* MEET SAM: SAM does the work, you approve */}
      <MeetSamSection />

      {/* TODAY VS. SOUNDREADY */}
      <VsRestSection />

      {/* PRICING, 3 tiers */}
      <section id="pricing" className="px-4 py-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Pricing")}</p>
            <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight">
              {t("Your next three songs are free")}<br />
              <span className="text-primary">{t("Add SAM when you're ready")}</span>
            </h2>
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
                    alt="SAM, the SoundReady Artist Manager robot pointing at the Digital Manager card"
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
                  {tier.founding && <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] lg:text-[10px] font-bold uppercase tracking-wide">Early Bird Special</span>}
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

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            {t("Payments secured by Stripe · Cancel anytime")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* FINAL CTA */}
      <section className="px-4 py-24 text-center bg-gradient-to-t from-primary/8 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              {t("Your music")}<br />
              <span className="text-primary">{t("in motion")}</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t("Start with three songs free. Add SAM when you're ready.")}
            </p>
          </div>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
            {t("Start Free")}
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("Start with 3 songs. No card required.")}</p>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}