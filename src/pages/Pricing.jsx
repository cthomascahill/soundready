import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Dip your toes in. No credit card required.",
    features: [
      "2 AI release analyses per month",
      "Algorithm Outlook & scoring",
      "Playlist pitch suggestions",
      "Release checklist (basic)",
      "Social media caption generator",
      "Gig Finder access",
      "Algorithm Guide access",
      "Community access",
    ],
    excluded: [
      "Full report (all sections)",
      "PDF download",
      "Saved reports",
      "AI Mastering",
      "Curator CRM",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    description: "The essential release toolkit — analyze, promote, and distribute your music.",
    features: [
      "5 AI release analyses per month",
      "Full report — all 12 sections",
      "PDF download & export",
      "Save up to 25 reports",
      "Hook Finder",
      "TikTok script generator",
      "Content Scheduler",
      "Budget Tracker",
      "Royalty Dashboard",
      "Distribution checklist manager",
      "Analytics dashboard",
      "Playlist Pitcher",
      "Press Kit generator",
      "Pitch Deck generator",
      "Link-in-Bio builder",
      "Newsletter Builder",
      "Email support",
    ],
    excluded: [
      "AI Mastering",
      "Tour Planner & Finance",
      "Venue Contracts & Legal Templates",
      "Music Academy & Algorithm Guide",
      "Curator CRM & Sync Pitcher",
    ],
    cta: "Start for $9.99/mo",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 24.99,
    annualPrice: 19.99,
    description: "Everything in Starter plus touring, legal, learning — the complete artist OS.",
    features: [
      "Unlimited AI release analyses",
      "Everything in Starter",
      "AI Mastering (5 credits/month)",
      "Curator CRM",
      "Sync Licensing Pitcher",
      "TikTok Creator Outreach",
      "Email Campaign manager",
      "Merch Store tracker",
      "Invoice Manager",
      "— Tour —",
      "Tour Planner & Route builder",
      "Tour Finance tracker",
      "Tour Opportunities & opening slots",
      "Tax Estimator",
      "— Legal —",
      "Venue Contract generator",
      "Legal Templates library",
      "Rights & splits manager",
      "— Learn —",
      "Music Academy full access",
      "Algorithm Guide deep-dive",
      "Community access",
      "Priority AI generation",
      "Priority email support",
    ],
    excluded: [],
    cta: "Go Pro — $24.99/mo",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "label",
    name: "Label",
    monthlyPrice: 79.99,
    annualPrice: 63.99,
    description: "Built for managers, indie labels, and multi-artist teams.",
    features: [
      "Everything in Pro",
      "Up to 10 artist profiles",
      "Team member access (up to 5 seats)",
      "White-label PDF reports",
      "Unlimited AI Mastering",
      "Dedicated account manager",
      "Custom onboarding call",
      "Early access to new features",
      "SLA-backed support",
    ],
    excluded: [],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const ADD_ONS = [
  { label: "Extra mastering credit", price: 12, unit: "per song" },
  { label: "Additional analysis", price: 4, unit: "per report" },
  { label: "Full PDF export pack", price: 7, unit: "one-time" },
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments. Cancel anytime from your account settings.",
  },
  {
    q: "Do unused analyses roll over?",
    a: "No. Analyses reset at the start of each billing cycle.",
  },
  {
    q: "What file formats do you accept?",
    a: "MP3, WAV, AAC, and FLAC up to 50MB.",
  },
  {
    q: "Is my music kept private?",
    a: "Yes. Your uploaded tracks are never shared or used for any purpose other than generating your report.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a full refund within 48 hours of your first charge if you are not satisfied.",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="font-heading text-5xl font-bold tracking-tight mb-3">Simple pricing for serious artists</h1>
            <p className="text-lg text-muted-foreground">Start free. Upgrade when you are ready to launch.</p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? "font-bold text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative h-8 w-14 rounded-full border-2 transition-colors ${isAnnual ? "bg-primary border-primary" : "bg-secondary border-border"}`}
            >
              <div className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${isAnnual ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm ${isAnnual ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              Annual <span className="text-xs text-primary font-bold">Save 20%</span>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Plan cards */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const originalPrice = isAnnual && plan.monthlyPrice ? plan.monthlyPrice : null;

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                  plan.highlighted
                    ? "bg-card ring-2 ring-primary/40 shadow-lg"
                    : "bg-card border-border hover:border-primary/20"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <h3 className="font-heading font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    {originalPrice && isAnnual && (
                      <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
                    )}
                    <span className="font-heading text-3xl font-black">${price}</span>
                    {price > 0 && <span className="text-muted-foreground text-sm">/month {isAnnual && "billed annually"}</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground">{f}</span>
                    </div>
                  ))}
                  {plan.excluded.map(f => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <X className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <Button variant={plan.highlighted ? "default" : "outline"} className="w-full text-xs font-semibold">
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section className="px-4 pb-16 border-t border-border pt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">À la carte</p>
            <h2 className="font-heading text-3xl font-bold">One-time add-ons</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ADD_ONS.map((addon, i) => (
              <motion.div key={addon.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card border border-border p-4 text-center space-y-2"
              >
                <p className="font-heading text-2xl font-bold text-primary">${addon.price}</p>
                <p className="text-xs font-medium">{addon.label}</p>
                <p className="text-xs text-muted-foreground">{addon.unit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 border-t border-border pt-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">FAQ</p>
            <h2 className="font-heading text-3xl font-bold">Common questions</h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-lg bg-card border border-border p-4 space-y-2"
              >
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