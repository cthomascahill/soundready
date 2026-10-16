import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calculator,
  Check,
  FileText,
  GraduationCap,
  ListMusic,
  Music,
  Rocket,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";

// The five milestones the clock counts down through as the artist scrolls.
const MILESTONES = [
  { time: "05:00", title: "Upload your first song." },
  { time: "04:00", title: "Your music is organized and your demo link is ready." },
  { time: "03:00", title: "Your personalized release plan appears." },
  { time: "02:00", title: "SAM activates and starts finding opportunities." },
  { time: "01:00", title: "Your playlist tools, royalty calculator, pitch templates, and Music Academy unlock." },
];

// The eight benefits, always visible below the clock.
const UNLOCKS = [
  {
    icon: Music,
    title: "Upload & Organize Your Music",
    body: "Upload your first song, instantly organize it, and generate a professional demo link to share with anyone.",
  },
  {
    icon: Rocket,
    title: "Get Your Personalized Promotional Plan",
    body: "Receive a step-by-step release strategy designed to give your music its best chance of success.",
  },
  {
    icon: Bot,
    title: "Meet Your 24/7 Digital Music Manager",
    body: "Have SAM working behind the scenes to discover real-world opportunities to grow your career.",
  },
  {
    icon: ListMusic,
    title: "Get Your Music Pitched to 2,000+ Spotify Playlists",
    body: "Tap into a massive playlist database to help get your music in front of real, organic listeners.",
  },
  {
    icon: BarChart3,
    title: "Discover What's Working",
    body: "Analyze your streaming performance and identify what's connecting with fans so you can double down on your success.",
  },
  {
    icon: Calculator,
    title: "Calculate Your Streaming Royalties",
    body: "Estimate how much your music is earning today and track your potential income as your streams grow.",
  },
  {
    icon: FileText,
    title: "Unlock a Proven Spotify Editorial Pitch Template",
    body: "Get access to a pitching template used to help place thousands of songs on Spotify editorial playlists.",
  },
  {
    icon: GraduationCap,
    title: "Access the SoundReady Music Academy",
    body: "Follow a step-by-step roadmap to build and scale your music business from zero to a professional career.",
  },
];

// The big countdown ring. The green arc fills as milestones complete.
function CountdownClock({ active }) {
  const r = 116;
  const circumference = 2 * Math.PI * r;
  const progress = (active + 1) / MILESTONES.length;
  const time = MILESTONES[active].time;

  return (
    <div className="relative h-64 w-64 sm:h-80 sm:w-80 mx-auto">
      <svg viewBox="0 0 260 260" className="h-full w-full -rotate-90">
        <circle cx="130" cy="130" r={r} fill="none" strokeWidth="10" className="stroke-muted/70" />
        <motion.circle
          cx="130"
          cy="130"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ type: "spring", stiffness: 45, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={time}
          initial={{ scale: 1.2, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-heading text-6xl sm:text-7xl font-black tabular-nums"
        >
          {time}
        </motion.span>
        <span className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
          To get started
        </span>
      </div>
    </div>
  );
}

export default function FiveMinuteSection() {
  const { t } = useLang();
  const [isAuth, setIsAuth] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  return (
    <section className="px-4 py-20 sm:py-28 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto rounded-3xl border border-border bg-card px-5 py-12 sm:px-10 sm:py-16 space-y-12 sm:space-y-16"
      >
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-wider font-bold">
            {t("Your career starts now")}
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
            {t("In just 5 minutes,")}
            <br />
            <span className="text-primary">{t("your music career could look completely different")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("Stop spending months figuring out your next move. With SoundReady, you can start building your career from the moment you sign up.")}
          </p>
        </div>

        {/* Clock + the five milestones it counts through */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          <CountdownClock active={active} />

          <ol className="space-y-3">
            {MILESTONES.map((m, i) => {
              const reached = i <= active;
              return (
                <motion.li
                  key={m.time}
                  onViewportEnter={() => setActive(i)}
                  viewport={{ margin: "-40% 0px -40% 0px" }}
                  className={`flex items-center gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition-colors duration-500 ${
                    reached ? "border-primary/50 bg-primary/5" : "border-border bg-secondary/40"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                      reached ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    {reached && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" strokeWidth={3.5} />
                      </motion.span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-xs sm:text-sm font-bold text-primary tabular-nums">{m.time}</p>
                    <p
                      className={`text-sm sm:text-base font-bold leading-snug transition-colors duration-500 ${
                        reached ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {t(m.title)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* The eight benefits, always visible */}
        <div className="space-y-6">
          <p className="text-center font-heading text-xl sm:text-2xl font-black">
            {t("Here's what you unlock")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {UNLOCKS.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.08 }}
                className="rounded-xl border border-border bg-secondary/40 p-4 sm:p-5"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-3">
                  <u.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <p className="font-bold text-sm sm:text-base">{t(u.title)}</p>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(u.body)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto space-y-3 text-center">
          <p className="font-heading text-lg sm:text-2xl font-black">
            {t("5 minutes to start. Your whole career ahead.")}
          </p>
          <Button
            size="lg"
            className="w-full h-12 sm:h-14 font-heading font-black text-sm sm:text-base gap-2"
            onClick={() => { window.location.href = isAuth ? "/dashboard" : "/register"; }}
          >
            {t("Start Your 5 Minutes - Free")}
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("Start with 3 songs. No card required.")}
          </p>
        </div>
      </motion.div>
    </section>
  );
}