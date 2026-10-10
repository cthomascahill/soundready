import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// The six statements every visitor should recognize themselves in, so they
// know in seconds that SoundReady was built for them.
const STATEMENTS = [
  "You're making music on your own, and you're serious about it",
  "You want music to be your full-time job, not just a hobby",
  "You're tired of guessing what to do next with your career",
  "You need someone in your corner who knows the business",
  "You want to grow your audience without paying a manager 15–20%",
  "You believe your best work is still ahead of you",
];

export default function ForYouIfSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-24">
      <div className="max-w-3xl mx-auto space-y-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("Who SoundReady is for")}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t("SoundReady is for you ")}<span className="text-primary font-black">{t("if…")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("Whether you're a 15-year-old guitarist in the middle of Indiana or the next Drake in the making, this was built for you.")}
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3 text-left"
        >
          {STATEMENTS.map((s, i) => (
            <motion.li
              key={s}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 sm:px-5 py-3.5 sm:py-4"
            >
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="font-heading text-sm sm:text-base font-semibold leading-snug">{t(s)}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}