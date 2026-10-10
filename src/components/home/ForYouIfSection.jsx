import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

// Transformation-focused comparison: where the artist is now without
// SoundReady, versus who they become with it.
const WITHOUT = [
  "You release songs and hope someone hears them.",
  "You don't know what to do next.",
  "You're doing everything alone.",
  "Your music feels like an expensive hobby.",
  "You're waiting for your big break.",
];

const WITH = [
  "You have a plan to reach real listeners.",
  "You wake up knowing your next move.",
  "You have a digital music manager helping you.",
  "You're building a real music business.",
  "You're taking steps toward creating your big break.",
];

export default function ForYouIfSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-5"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            {t("You make the music.")}<br />
            <span className="text-primary">{t("We'll help you build the career.")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("SoundReady helps independent artists stop guessing, find direction, and start building a real music career.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WITHOUT SOUNDREADY — the struggle, muted and dimmed */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8"
          >
            <p className="font-heading text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
              {t("Without SoundReady")}
            </p>
            <ul className="space-y-5">
              {WITHOUT.map((s) => (
                <li key={s} className="flex items-start gap-3.5">
                  <span className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5 text-red-400" />
                  </span>
                  <span className="text-sm sm:text-base text-muted-foreground leading-snug">{t(s)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* WITH SOUNDREADY — the transformation, green and alive */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 shadow-2xl shadow-primary/10"
          >
            <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-2xl pointer-events-none" />
            <p className="relative font-heading text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-6">
              {t("With SoundReady")}
            </p>
            <ul className="relative space-y-5">
              {WITH.map((s) => (
                <li key={s} className="flex items-start gap-3.5">
                  <span className="h-6 w-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-foreground leading-snug">{t(s)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/register">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12">
              {t("Stop guessing. Start building.")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}