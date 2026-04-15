import { motion } from "framer-motion";
import { ArrowRight, Rocket, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 py-32 text-center bg-gradient-to-b from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
              <Rocket className="h-3.5 w-3.5" />
              The AI Release Platform Built for Independent Artists
            </div>
            <h1 className="font-heading text-6xl sm:text-7xl font-black tracking-tight leading-tight">
              Release <span className="text-primary">smarter.</span><br />
              Grow <span className="text-primary">faster.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-body">
              SoundReady eliminates the guesswork. In 60 seconds, get a complete release strategy powered by real music industry data, algorithm insights, and AI that thinks like an A&R.
            </p>
          </div>
          <Button 
            size="lg" 
            className="gap-2 font-heading font-bold text-base px-8"
            onClick={() => base44.auth.redirectToLogin().catch(e => console.error('Login error:', e))}
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* The Problem */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Problem</p>
            <h2 className="font-heading text-4xl font-bold">You're competing against major label artists.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Independent artists have all the same tools as majors — but none of the knowledge. No strategy consultant. No algorithm specialist. No booking team. No PR agency. You're flying blind while label artists have a whole playbook.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The Solution</p>
            <h2 className="font-heading text-4xl font-bold">SoundReady is your invisible A&R team.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AI-powered strategy meets real music industry knowledge. Within 60 seconds of describing your song, you get the exact playbook major label artists follow — release timing, algorithm targeting, content strategy, playlist pitches, and booking angles. Then track everything and optimize in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-24 border-t border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">The SoundReady Advantage</p>
            <h2 className="font-heading text-4xl font-bold">25+ integrated tools that work together.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every tool connects. Release data powers your analytics. Analytics inform your next release strategy. Built as one system, not a collection of apps.</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-2">
              <p className="font-heading text-4xl sm:text-5xl font-black text-primary">60s</p>
              <p className="text-sm text-muted-foreground">Get a full release strategy</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center space-y-2">
              <p className="font-heading text-4xl sm:text-5xl font-black text-primary">25+</p>
              <p className="text-sm text-muted-foreground">Integrated tools & features</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center space-y-2">
              <p className="font-heading text-4xl sm:text-5xl font-black text-primary">1</p>
              <p className="text-sm text-muted-foreground">Unified platform</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-32 border-t border-border">
        <div className="max-w-6xl mx-auto space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="text-xs text-primary uppercase tracking-wider font-bold">Simple Pricing</p>
            <h2 className="font-heading text-5xl font-bold">Choose your plan.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Start free, upgrade when you're ready.</p>
          </motion.div>

          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { id: "free", name: "Free", price: null, features: ["2 analyses/month", "Algorithm Outlook & scoring", "Social caption generator", "Community access"] },
              { id: "starter", name: "Starter", price: "$9.99/mo", features: ["5 analyses/month", "Full reports + PDF", "Promote & Distribute tools", "Analytics + Budget Tracker"] },
              { id: "pro", name: "Pro", price: "$24.99/mo", features: ["Unlimited analyses + AI Mastering", "Tour Planner & Finance", "Venue Contracts & Legal Templates", "Music Academy + Algorithm Guide"], highlighted: true },
              { id: "label", name: "Label", price: "$79.99/mo", features: ["Everything in Pro", "10 artist profiles + 5 seats", "White-label PDFs", "Dedicated support & SLA"] },
            ].map((plan, i) => (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col ${plan.highlighted ? "bg-card ring-2 ring-primary/40 shadow-lg" : "bg-card border-border"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className="space-y-4 mb-6">
                  <h3 className="font-heading font-bold text-xl">{plan.name}</h3>
                  <div className="text-3xl font-black">{plan.price || "Free"}</div>
                </div>
                <div className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => base44.auth.redirectToLogin().catch(e => console.error('Login error:', e))}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full font-heading font-semibold">
                  Sign In
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center space-y-4 pt-8 border-t border-border">
            <p className="text-muted-foreground">Already have an account?</p>
            <Button
              size="lg"
              className="gap-2 font-heading font-bold text-base px-8"
              onClick={() => base44.auth.redirectToLogin().catch(e => console.error('Login error:', e))}
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}