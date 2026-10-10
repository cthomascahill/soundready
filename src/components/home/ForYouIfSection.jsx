import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Six plain statements a visitor should recognize themselves in instantly.
// Short sentences, big type, no noise.
const STATEMENTS = [
  "You're serious about your music career.",
  "You want music to be your full-time job.",
  "You're struggling to get real listeners.",
  "You're tired of guessing what to do next.",
  "You can't afford a manager yet.",
  "You know you have what it takes.",
];

export default function ForYouIfSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-28">
      <div className="max-w-4xl mx-auto space-y-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight"
        >
          {t("SoundReady is for you if")}
        </motion.h2>

        <div className="space-y-6 sm:space-y-7">
          {STATEMENTS.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-center gap-4"
            >
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
              <span className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-left">
                {t(s)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}