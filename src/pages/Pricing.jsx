import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Zap, Star, Crown, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: null,
    period: null,
    description: "Get a taste of what's possible.",
    icon: Zap,
    color: "text-muted-foreground",
    bg: "bg-secondary/40",
    border: "border-border",
    features: [
      "1 analysis per month",
      "Algorithm Outlook section",
      "Playlist Pitch section",
      "Watermarked results",
    ],
    missing: [
      "Full report (all sections)",
      "PDF download",
      "Saved reports",
      "Release checklist",
      "Social media captions",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 9.99,
    period: "month",
    description: "Everything you need for your first release.",
    icon: Star,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/30",
    features: [
      "3 analyses per month",
      "Full report — all sections",
      "PDF download",
      "Save up to 10 reports",
      "Release checklist",
      "Social media captions",
    ],
    missing: [
      "Curator CRM",
      "Marketing asset generator",
      "Hook Finder",
      "Mastering credits",
    ],
    cta: "Start Starter",
    ctaVariant: "outline",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 24.99,
    period: "month",
    description: "The full toolkit for serious independent artists.",
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    features: [
      "Unlimited analyses",
      "Everything in Starter",
      "Curator CRM",
      "Release Planner",
      "Marketing asset generator",
      "Hook Finder",
      "Priority report generation",
      "2 mastering credits / month included",
    ],
    missing: [],
    cta: "Go Pro",
    ctaVariant: "default",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "label",
    name: "Label / Manager",
    price: 79.99,
    period: "month",
    description: "Built for teams, managers, and small labels.",
    icon: Building2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    features: [
      "Everything in Pro",
      "Up to 10 artist profiles",
      "Team access",
      "White label PDF reports",
      "Unlimited mastering",
      "Dedicated support",
    ],
    missing: [],
    cta: "Contact Us",
    ctaVariant: "outline",
    highlighted: false,
  },
];

const ADD_ONS = [
  { label: "Extra mastering credit", price: "$12", unit: "per song" },
  { label: "Additional analysis", price: "$4", unit: "per report" },
  { label: "Full PDF export pack", price: "$7", unit: "one-time" },
];

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes — all plans are month-to-month with no contracts. Cancel from your profile at any time." },
  { q: "What counts as an 'analysis'?", a: "Each time you submit a song and generate a full release plan, that counts as one analysis." },
  { q: "Do unused analyses roll over?", a: "No, monthly analyses reset at the start of each billing cycle." },
  { q: "What are mastering credits?", a: "Each credit lets you process one audio file through AI Mastering — EQ, compression, and -14 LUFS normalization for streaming." },
  { q: "Is there a free trial for Pro?", a: "We offer a 7-day free trial on the Pro plan. No credit card required to start." },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Zap className="h-3 w-3" />
            Simple, transparent pricing
          </div>
          <h1 className="font-heading text-5xl font-bold tracking-tight">
            Plans for every artist.
          </h1>
          <p className="text-muted-foreground text-lg">
            From your first drop to running a label — SoundReady grows with you.
          </p>
        </motion.div>
      </section>

      {/* Plan cards */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-2xl border ${plan.border} ${plan.highlighted ? "bg-card ring-2 ring-primary/40 shadow-lg shadow-primary/10" : "bg-card"} p-6 flex flex-col`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="space-y-3 mb-6">
                  <div className={`h-10 w-10 rounded-xl ${plan.bg} border ${plan.border} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${plan.color}`} />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-lg">{plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{plan.description}</p>
                  </div>
                  <div className="pt-1">
                    {plan.price ? (
                      <div className="flex items-end gap-1">
                        <span className="font-heading text-4xl font-black">${plan.price}</span>
                        <span className="text-muted-foreground text-sm mb-1">/ {plan.period}</span>
                      </div>
                    ) : (
                      <span className="font-heading text-4xl font-black">Free</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-35">
                      <div className="h-4 w-4 shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="h-0.5 w-3 bg-muted-foreground rounded-full" />
                      </div>
                      <span className="text-sm text-muted-foreground line-through">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6">
                  <Link to="/">
                    <Button
                      variant={plan.ctaVariant}
                      className={`w-full font-heading font-semibold ${plan.highlighted ? "" : ""}`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section className="px-4 pb-16 border-t border-border pt-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-widest font-medium">À la carte</p>
            <h2 className="font-heading text-3xl font-bold">One-time add-ons</h2>
            <p className="text-muted-foreground">No subscription needed — buy exactly what you need.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ADD_ONS.map((a, i) => (
              <motion.div key={a.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-border p-5 space-y-3 text-center">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <p className="font-heading font-bold text-2xl">{a.price}</p>
                <div>
                  <p className="font-semibold text-sm">{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.unit}</p>
                </div>
                <Button size="sm" variant="outline" className="w-full text-xs">Add On</Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 border-t border-border pt-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
            <p className="text-xs text-primary uppercase tracking-widest font-medium">FAQ</p>
            <h2 className="font-heading text-3xl font-bold">Common questions</h2>
          </motion.div>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl bg-card border border-border p-5 space-y-2">
                <p className="font-semibold text-sm">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}