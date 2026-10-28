import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import SEO from "@/components/SEO";
import { base44 } from "@/api/base44Client";

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
      const data = res?.data ?? res;
      setStatus(data?.status === "already_joined" ? "already" : "joined");
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
        className="relative w-full max-w-md text-center"
      >
        <div className="mb-8 flex justify-center">
          <SoundReadyLogo size={44} />
        </div>

        <p className="font-heading text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase">
          Launching Soon
        </p>

        {status === "joined" || status === "already" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <p className="font-heading text-xl font-bold">
              {status === "already" ? "You're already on the list." : "Thanks for joining!"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll email you the moment SoundReady launches.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={join} className="mt-10 flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@artist.com"
              aria-label="Email address"
              className="flex-1 h-12 px-4 text-base rounded-xl bg-card border-border"
              disabled={status === "joining"}
            />
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
      </motion.div>
    </div>
  );
}