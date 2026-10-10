import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Two sides: who SoundReady is for (left, green arrows) and who it isn't
// (right, red X) — plain, big, read-at-a-glance statements.
const FOR_YOU = [
  "You're serious about your music career.",
  "You want music to be your full-time job.",
  "You're struggling to get real listeners.",
  "You're tired of guessing what to do next.",
  "You know you have what it takes.",
];

const NOT_FOR_YOU = [
  "Music is just a hobby.",
  "You're happy with where you are.",
  "You're waiting to be discovered.",
  "You want success overnight.",
  "You don't want to put in the work.",
];

export default function ForYouIfSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-28">
      <div className="max-w-6xl mx-auto space-y-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight"
        >
          {t("SoundReady is for you if")}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0">
          {/* LEFT: this is you */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-7 lg:pr-16"
          >
            {FOR_YOU.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4"
              >
                <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </span>
                <span className="font-heading text-lg sm:text-2xl font-bold tracking-tight leading-snug">
                  {t(s)}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* RIGHT: this isn't you */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-7 lg:pl-16 lg:border-l border-border"
          >
            {NOT_FOR_YOU.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4"
              >
                <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </span>
                <span className="font-heading text-lg sm:text-2xl font-bold tracking-tight leading-snug text-muted-foreground">
                  {t(s)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}