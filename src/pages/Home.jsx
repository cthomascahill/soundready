import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
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
          <div className="flex gap-3 flex-wrap justify-center">
            <Button 
              size="lg" 
              className="gap-2 font-heading font-bold text-base px-8"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/register">
              <Button size="lg" variant="outline" className="gap-2 font-heading font-bold text-base px-8">
                Sign Up
              </Button>
            </Link>
          </div>
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

      {/* CTA */}
      <section className="px-4 py-32 border-t border-border text-center bg-gradient-to-t from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-5xl font-bold">Your strategy starts here.</h2>
            <p className="text-lg text-muted-foreground">Upload your song. Get your release plan. Execute like a major label.</p>
          </div>
          <Button
            size="lg"
            className="gap-2 font-heading font-bold text-base px-8"
            onClick={() => base44.auth.redirectToLogin()}
          >
            Sign In Free <Rocket className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}