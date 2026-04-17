import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Flame, Zap, Bot, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const PLANS = [
  {
    id: "free",
    icon: Zap,
    iconColor: "text-muted-foreground",
    name: "Free",
    tagline: "Test drive the platform.",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "No credit card. No commitment. See what SoundReady can do before you fire anyone.",
    features: [
      "2 AI release analyses per month",
      "Algorithm Outlook & scoring",
      "Social media caption generator",
      "Gig Finder access",
      "Community access",
    ],
    excluded: [
      "Full reports & PDF export",
      "Playlist pitching & Curator CRM",
      "Finance & royalty tracking",
      "AI-drafted pitches",
      "Human rep support",
    ],
    cta: "Start for Free",
    highlighted: false,
  },
  {
    id: "diy",
    icon: Zap,
    iconColor: "text-chart-5",
    name: "DIY",
    tagline: "You're the manager now.",
    monthlyPrice: 37,
    annualPrice: 29,
    description: "All the tools a manager uses — in your hands. You do the work, you keep 100% of your income.",
    features: [
      "Unlimited AI release analyses",
      "Full reports — all 12 sections",
      "PDF download & export",
      "Playlist Pitcher + Curator CRM",
      "Press Kit & EPK generator",
      "Pitch Deck generator",
      "Sync Licensing Pitcher",
      "Finance tracker + Budget tool",
      "Royalty Dashboard",
      "Distribution checklist manager",
      "Analytics dashboard",
      "Booking tools + Gig Finder",
      "Link-in-Bio builder",
      "Content Scheduler + Newsletter",
      "Invoice Manager",
      "AI Mastering (3 credits/mo)",
    ],
    excluded: [
      "AI-drafted & queued pitches",
      "Auto-flagged opportunities",
      "Human rep support",
    ],
    cta: "Get DIY — $37/mo",
    highlighted: false,
  },
  {
    id: "ai_manager",
    icon: Bot,
    iconColor: "text-primary",
    name: "AI Manager",
    tagline: "Your manager works 24/7.",
    monthlyPrice: 97,
    annualPrice: 77,
    description: "AI preps everything and hands it to you for approval. Drafted pitches, flagged opportunities, built EPKs. One-tap execution.",
    features: [
      "Everything in DIY",
      "AI-drafted pitch emails ready to approve",
      "Auto-flagged sync + tour opportunities",
      "Smart P&L reports generated automatically",
      "AI Mastering (10 credits/mo)",
      "Priority AI generation (faster, smarter)",
      "Collaboration Workspace",
      "Tour Planner & Finance",
      "Venue Contracts & Legal Templates",
      "Rights & splits manager",
      "Music Academy full access",
      "Algorithm Guide deep-dive",
      "Tax Estimator",
      "Priority email support",
    ],
    excluded: [
      "Dedicated human rep",
      "Active pitching on your behalf",
    ],
    cta: "Get AI Manager — $97/mo",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "rep",
    icon: UserCheck,
    iconColor: "text-yellow-400",
    name: "SoundReady Rep",
    tagline: "A real human in your corner.",
    monthlyPrice: null,
    annualPrice: null,
    description: "A dedicated rep actively pitches you for tours, sync, press, and playlists. They already know everything about you.",
    features: [
      "Everything in AI Manager",
      "Dedicated human rep assigned to your account",
      "Active pitching: tours, sync, press & playlists",
      "Full P&L management by your rep",
      "Rep onboarding call within 48 hours",
      "Revenue share model — we win when you win",
      "Boutique management at a fraction of the cost",
      "Unlimited AI Mastering",
      "White-label PDF reports",
      "SLA-backed support",
    ],
    excluded: [],
    cta: "Apply for a Rep",
    highlighted: false,
  },
];

const FAQ = [
  {
    q: "Does SoundReady take a percentage of my income?",
    a: "Never. Unlike a traditional manager, SoundReady charges a flat monthly fee. You keep 100% of your earnings — always.",
  },
  {
    q: "What's the difference between DIY and AI Manager?",
    a: "On DIY, all the tools are in your hands — you do the work yourself. On AI Manager, the AI preps everything (drafts pitches, flags opportunities, builds your P&L) and surfaces it for your one-tap approval. It feels like a manager handing you things to sign off on.",
  },
  {
    q: "How does the SoundReady Rep tier work?",
    a: "You get a real human rep assigned to your account. They actively pitch you for tours, sync placements, press, and playlist placement. Because your full artist profile and history lives on the platform, your rep is already briefed from day one. Pricing is custom and includes a rev share component.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments. Cancel anytime from your account settings.",
  },
  {
    q: "What file formats do you accept?",
    a: "MP3, WAV, AAC, and FLAC up to 50MB.",
  },
  {
    q: "Is my music kept private?",
    a: "Yes. Your uploaded tracks are never shared or used for any purpose other than generating your analysis.",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="px-4 pt-20 pb-16 text-center bg-gradient-to-b from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold tracking-wider uppercase">
            <Flame className="h-3.5 w-3.5" />
            Fire Your Manager
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-black tracking-tight leading-tight">
            Management that doesn't<br />take your money.
          </h1>
          <p className="text-lg text-muted-foreground">From $37/mo. No percentage cuts. No contracts. Cancel anytime.</p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? "font-bold text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative h-8 w-14 rounded-full border-2 transition-colors ${isAnnual ? "bg-primary border-primary" : "bg-secondary border-border"}`}
            >
              <div className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${isAnnual ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm ${isAnnual ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              Annual <span className="text-xs text-primary font-bold">Save ~22%</span>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Plan cards */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                  plan.highlighted
                    ? "bg-card ring-2 ring-primary/40 shadow-xl border-primary/30"
                    : "bg-card border-border hover:border-primary/20"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-2 mb-5">
                  <plan.icon className={`h-6 w-6 ${plan.iconColor}`} />
                  <h3 className="font-heading font-black text-xl">{plan.name}</h3>
                  <p className={`text-xs font-semibold ${plan.iconColor}`}>{plan.tagline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                  <div className="flex items-baseline gap-1 pt-1">
                    {price === null ? (
                      <span className="font-heading text-2xl font-black">Custom</span>
                    ) : price === 0 ? (
                      <span className="font-heading text-3xl font-black">Free</span>
                    ) : (
                      <>
                        {isAnnual && plan.monthlyPrice > 0 && (
                          <span className="text-sm text-muted-foreground line-through">${plan.monthlyPrice}</span>
                        )}
                        <span className="font-heading text-3xl font-black">${price}</span>
                        <span className="text-muted-foreground text-sm">/mo{isAnnual && price > 0 ? " billed annually" : ""}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 flex-1 mb-5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground">{f}</span>
                    </div>
                  ))}
                  {plan.excluded.map(f => (
                    <div key={f} className="flex items-start gap-2.5 opacity-35">
                      <X className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full text-xs font-semibold"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Comparison callout */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center space-y-4">
            <Flame className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-heading text-2xl font-bold">The math doesn't lie.</h3>
            <div className="grid grid-cols-2 gap-4 text-center max-w-md mx-auto">
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 space-y-1">
                <p className="font-heading text-3xl font-black text-destructive">$7,500+</p>
                <p className="text-xs text-muted-foreground">What a manager takes on $50K/year income</p>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-1">
                <p className="font-heading text-3xl font-black text-primary">$444</p>
                <p className="text-xs text-muted-foreground">SoundReady DIY annual cost — all tools included</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 border-t border-border pt-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Questions</p>
            <h2 className="font-heading text-3xl font-bold">Straight answers.</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-lg bg-card border border-border p-4 space-y-2">
                <p className="text-sm font-semibold">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}