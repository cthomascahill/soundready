import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Each row is a pair: the left statement is exactly who SoundReady is for,
// the right statement is its direct opposite — so every line reads as
// "this is me" vs "that's not me".
const PAIRS = [
  ["You're serious about your music career.", "Music is just a hobby."],
  ["You want music to be your full-time job.", "Music is just a side project."],
  ["You're struggling to get real listeners.", "You're happy with where you are."],
  ["You're tired of guessing what to do next.", "You're fine just winging it."],
  ["You know you have what it takes.", "You're waiting to be discovered."],
  ["You want to build a real fanbase.", "You want success overnight."],
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

        <div className="space-y-8 sm:space-y-9">
          {PAIRS.map(([yes, no], i) => (
            <motion.div
              key={yes}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-1 lg:grid-cols-2 lg:gap-0 items-center"
            >
              {/* Left: this is you */}
              <div className="flex items-center gap-4 lg:pr-16">
                <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </span>
                <span className="font-heading text-lg sm:text-2xl font-bold tracking-tight leading-snug">
                  {t(yes)}
                </span>
              </div>

              {/* Right: the opposite, same row */}
              <div className="flex items-center gap-4 mt-4 lg:mt-0 lg:pl-16 lg:border-l border-border">
                <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </span>
                <span className="font-heading text-lg sm:text-2xl font-bold tracking-tight leading-snug text-muted-foreground">
                  {t(no)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}