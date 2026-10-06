import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Upload, BarChart2, Zap, CalendarDays, Mic2, MapPin,
  DollarSign, FileText, Radio, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/public/PublicNav";
import SEO from "@/components/SEO";
import { useLang } from "@/lib/i18n/LanguageContext";

const STEPS = [
  { n: "01", icon: Upload, title: "Drop your song in", line: "MP3, WAV, AAC — it lives in your Vault." },
  { n: "02", icon: BarChart2, title: "Get the report", line: "Real audio analysis, real numbers." },
  { n: "03", icon: CalendarDays, title: "Track it", line: "Idea to released, every step on record." },
  { n: "04", icon: Zap, title: "Run the plan", line: "A 6-week release plan, generated." },
  { n: "05", icon: Mic2, title: "Pitch playlists", line: "Personalized pitches, ready to send." },
  { n: "06", icon: MapPin, title: "Book shows", line: "843+ venues, inquiries, tour routing." },
  { n: "07", icon: DollarSign, title: "See your money", line: "Every royalty and expense, one place." },
  { n: "08", icon: FileText, title: "Protect your deals", line: "Risky clauses flagged, plain English." },
  { n: "09", icon: Radio, title: "Stay ahead", line: "Signings, grants, deadlines in your market." },
  { n: "10", icon: Users, title: "Bring your team", line: "One workspace, same plan." },
];

const STATS = [
  { num: "+200%", sub: "Average revenue increase in 12 months" },
  { num: "+78%", sub: "More streams with strategy + pitching" },
  { num: "+120%", sub: "More shows booked" },
  { num: "10+ hrs", sub: "Back in your week" },
  { num: "40+", sub: "Tools, one login" },
  { num: "$37/mo", sub: "Flat. Never a percentage" },
];

const TIERS = [
  { name: "Artist", price: "$0", tagline: "Vault (5 songs) + Tracker. Free forever.", cta: "Start Free", badge: null, featured: false },
  { name: "Artist Pro", price: "$37/mo", tagline: "Every tool unlocked, plus your team. 7 days free.", cta: "Start Pro", badge: "7-Day Free Trial", featured: false },
  { name: "AI Manager", price: "$60/mo", tagline: "Sam outbounds for you every week. You approve.", cta: "Start Manager", badge: "Sam Works For You", featured: true },
];

export default function HowItWorks() {
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
    <div className="min-h-screen bg-background font-body">
      <SEO
        title="How It Works — SoundReady"
        description="Drop a song in, get your release plan, and let Sam — your AI manager — draft the outreach. Ten steps, one system."
      />
      <PublicNav />

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
            {t("How It Works")}
          </motion.div>
          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            {t("Sam works your career.")}<br />
            <span className="text-primary">{t("You make the music.")}</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("Drop your music in. Sam drafts the outreach. You approve.")}
          </p>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12" onClick={handleCTA}>
            {t("Start")} <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

      </section>

      {/* TEN STEPS */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">{t("The Process")}</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("Ten steps. One system.")}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((step, i) => (
              <motion.div key={step.n}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: (i % 5) * 0.06 }}
                className="rounded-xl bg-card border border-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-2xl text-primary/25 leading-none select-none">{step.n}</span>
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-heading font-bold text-sm">{t(step.title)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(step.line)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE NUMBERS */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">{t("The Results")}</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("Not promises. Outcomes.")}</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-primary/20 p-6 space-y-2 text-center">
                <p className="font-heading text-4xl font-black text-primary">{s.num}</p>
                <p className="text-xs text-muted-foreground">{t(s.sub)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-4 py-24 border-t border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("Sam is the product. Everything else comes with it.")}</h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <motion.div key={tier.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-2xl border border-border p-6 flex flex-col bg-card ${tier.featured ? "ring-2 ring-primary/60 shadow-xl" : ""}`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}
                <p className="font-heading font-black text-2xl">{tier.name}</p>
                <p className="text-2xl font-black mt-1 mb-2">{tier.price}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{t(tier.tagline)}</p>
                <Button
                  className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => { window.location.href = isAuth ? "/history" : "/pricing"; }}
                >
                  {t(tier.cta)}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto space-y-8">
          <h2 className="font-heading text-5xl sm:text-6xl font-black leading-[0.95]">
            {t("The artists winning right now")}<br />
            <span className="text-primary">{t("have a system. Be one of them.")}</span>
          </h2>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12" onClick={handleCTA}>
            {t("Start")} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">{t("No contracts. No percentage cuts. Start free.")}</p>
        </motion.div>
      </section>
    </div>
  );
}