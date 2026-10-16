import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// The five milestones. Each lights up green with a spring checkmark
// as its minute passes on the countdown.
const MILESTONES = [
  {
    span: "05:00 → 04:00",
    title: "Your Music Is Organized",
    body: "Upload your first song, organize it instantly, and generate a professional demo link ready to share.",
  },
  {
    span: "04:00 → 03:00",
    title: "Your Promotional Strategy Is Ready",
    body: "Get a personalized step-by-step promotional plan designed to give your next release its best chance of success.",
  },
  {
    span: "03:00 → 02:00",
    title: "Your Digital Manager Is Activated",
    body: "Meet SAM, your 24/7 digital music manager, helping you discover real-world opportunities to grow your career.",
  },
  {
    span: "02:00 → 01:00",
    title: "Your Promotion Tools Are Unlocked",
    body: "Access a database of 2,000+ Spotify playlists, plus an editorial pitching template used to help place thousands of songs.",
  },
  {
    span: "01:00 → 00:00",
    title: "Your Music Business Is Ready to Grow",
    body: "Unlock streaming analytics, a royalty earnings calculator, and the SoundReady Music Academy, your step-by-step guide to building and scaling your music business.",
  },
];

export default function MilestoneTimeline({ completedCount, activeIndex }) {
  const { t } = useLang();

  return (
    <ol className="space-y-3 sm:space-y-4">
      {MILESTONES.map((m, i) => {
        const completed = i < completedCount;
        const active = i === activeIndex && !completed;
        return (
          <motion.li
            key={m.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`flex gap-3.5 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition-all duration-500 ${
              completed
                ? "border-primary/50 bg-primary/5 shadow-[0_0_24px_-8px_rgba(74,222,128,0.35)]"
                : active
                ? "border-primary/30 bg-card"
                : "border-border bg-secondary/30"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                completed ? "bg-primary" : "bg-muted"
              }`}
            >
              {completed ? (
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 16 }}
                >
                  <Check className="h-5 w-5 text-primary-foreground" strokeWidth={3.5} />
                </motion.span>
              ) : (
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${
                    active ? "bg-primary animate-pulse" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] sm:text-xs font-bold text-primary/80 tracking-wide">{m.span}</p>
              <p
                className={`text-sm sm:text-base font-bold leading-snug transition-colors duration-500 ${
                  completed || active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t(m.title)}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(m.body)}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}