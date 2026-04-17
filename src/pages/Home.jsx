import { motion } from "framer-motion";
import { ArrowRight, Flame, Check, Zap, Bot, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: null,
    tagline: "Test drive it",
    icon: Zap,
    color: "text-muted-foreground",
    features: ["2 analyses/month", "Algorithm scoring", "Social captions", "Community access"],
  },
  {
    id: "diy",
    name: "DIY",
    price: "$37/mo",
    tagline: "You're the manager",
    icon: Zap,
    color: "text-chart-5",
    features: ["Unlimited analyses", "Full toolkit — all 25+ tools", "Playlist pitching + press kits", "Finance + royalty tracking"],
  },
  {
    id: "ai_manager",
    name: "AI Manager",
    price: "$97/mo",
    tagline: "AI does the work",
    icon: Bot,
    color: "text-primary",
    highlighted: true,
    features: ["Everything in DIY", "AI-drafted pitches to approve", "Auto-flagged opportunities", "One-tap execution"],
  },
  {
    id: "rep",
    name: "SoundReady Rep",
    price: "Custom",
    tagline: "Real human in your corner",
    icon: UserCheck,
    color: "text-yellow-400",
    features: ["Everything in AI Manager", "Dedicated human rep", "Active pitching for you", "Rev share — we win when you win"],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-24 text-center overflow-hidden bg-gradient-to-b from-primary/6 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold tracking-wider uppercase">
            <Flame className="h-3.5 w-3.5" />
            The Artist Management Revolution
          </motion.div>

          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight leading-[0.9]">
            Fire your<br />
            <span className="text-primary">manager.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            SoundReady does everything a manager does — without taking <span className="text-foreground font-bold">15–20% of your income.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12"
              onClick={() => base44.auth.redirectToLogin()}>
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="font-heading font-bold text-base px-8 h-12">
                See Pricing
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">From $37/mo. No contracts. No percentage cuts. Cancel anytime.</p>
        </motion.div>
      </section>

      {/* THE PROBLEM */}
      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <p className="text-xs text-destructive uppercase tracking-wider font-bold">The Problem</p>
            <h2 className="font-heading text-4xl font-bold">The artist-manager relationship is broken.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your manager takes 15–20% of every dollar you earn. They have 12 other clients. They ghost you for days. They pitch you wrong. And if you're unsigned? You can't even get one. You're managing yourself with none of the tools.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Fix</p>
            <h2 className="font-heading text-4xl font-bold">SoundReady is your manager now.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AI-powered tools that handle everything from release strategy to tour booking to sync pitching — for a flat fee. Or let our AI handle the prep and you just approve. Or get a real human rep who already knows your whole catalog.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-4 py-20 border-t border-border bg-secondary/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-3">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">Choose Your Tier</p>
            <h2 className="font-heading text-4xl font-bold">Management on your terms.</h2>
            <p className="text-muted-foreground">No percentage cuts. No contracts. Just tools and results.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border p-5 flex flex-col bg-card ${plan.highlighted ? "ring-2 ring-primary/40 shadow-xl border-primary/30" : "border-border"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <plan.icon className={`h-5 w-5 mb-3 ${plan.color}`} />
                <h3 className="font-heading font-black text-lg">{plan.name}</h3>
                <p className={`text-xs font-semibold mb-2 ${plan.color}`}>{plan.tagline}</p>
                <div className="text-2xl font-black mb-4">{plan.price || "Free"}</div>
                <div className="space-y-1.5 flex-1 mb-4">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs">{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full font-semibold text-xs"
                  onClick={() => base44.auth.redirectToLogin()}>
                  {plan.id === "rep" ? "Apply Now" : "Get Started"}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/pricing">
              <Button variant="outline" className="gap-2">View Full Pricing & Feature Comparison <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 text-center">
          {[
            { num: "15–20%", sub: "What a manager takes" },
            { num: "$37/mo", sub: "SoundReady starting price" },
            { num: "25+", sub: "Integrated management tools" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="space-y-2">
              <p className="font-heading text-3xl sm:text-5xl font-black text-primary">{s.num}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-28 border-t border-border text-center bg-gradient-to-t from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto space-y-6">
          <h2 className="font-heading text-5xl sm:text-6xl font-black">
            Fire your manager.<br /><span className="text-primary">Meet SoundReady.</span>
          </h2>
          <p className="text-muted-foreground text-lg">Start free. No credit card required.</p>
          <Button size="lg" className="gap-2 font-heading font-bold text-base px-10"
            onClick={() => base44.auth.redirectToLogin()}>
            Get Started <Flame className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}