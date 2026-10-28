import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Mail, Bot, ListChecks, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import SEO from "@/components/SEO";
import { base44 } from "@/api/base44Client";

const PERKS = [
  { icon: Bot, label: "SAM finds venues, playlists and deals for you" },
  { icon: ListChecks, label: "Your whole release pipeline in one place" },
  { icon: Music2, label: "Built for independent artists, not labels" },
];

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | joining | joined | already | error
  const [error, setError] = useState("");

  const join = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("joining");
    setError("");
    try {
      const res = await base44.functions.invoke("waitlistSignup", { email: trimmed });
      setStatus(res.data.status === "already_joined" ? "already" : "joined");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <SEO
        title="SoundReady is launching soon — join the waitlist"
        description="SoundReady is the digital music manager that finds venues, playlists and deals while you make music. Join the waitlist to get early access."
      />

      {/* Ambient green glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[720px] rounded-full bg-primary/15 blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-xl text-center"
      >
        <Link to="/" className="inline-flex mb-8">
          <SoundReadyLogo size={44} />
        </Link>

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">
          Launching soon
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          SoundReady is almost here.
        </h1>
        <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto">
          The digital music manager that finds opportunities, drafts outreach and
          plans your releases while you focus on the music. Get in line before
          everyone else.
        </p>

        {status === "joined" || status === "already" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-primary/25 bg-primary/10 px-6 py-8"
          >
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <p className="font-heading text-xl font-bold">
              {status === "already" ? "You're already on the list." : "You're on the list!"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll email you the moment SoundReady launches. No spam, ever.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={join} className="mt-10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@artist.com"
                aria-label="Email address"
                className="h-12 pl-10 text-base rounded-xl bg-card border-border"
                disabled={status === "joining"}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={status === "joining"}
              className="h-12 px-8 rounded-xl text-sm font-extrabold uppercase tracking-widest"
            >
              {status === "joining" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Join Waitlist"
              )}
            </Button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-12 grid gap-3 text-left">
          {PERKS.map((perk) => (
            <div
              key={perk.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3"
            >
              <perk.icon className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-foreground/90">{perk.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
          <span className="mx-2 text-border">·</span>
          <Link to="/about" className="text-primary font-semibold hover:underline">
            Explore the platform
          </Link>
        </p>
      </motion.div>
    </div>
  );
}