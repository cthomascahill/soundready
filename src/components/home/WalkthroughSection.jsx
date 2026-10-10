import { Fragment } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Shared 3-step walkthrough: numbered steps, arrows between them, and a
// product-accurate screen mock for each step.
export default function WalkthroughSection({ id, eyebrow, headline, headlineAccent, sub, headerExtra, steps, below }) {
  const { t } = useLang();
  return (
    <section id={id} className="px-4 py-16 scroll-mt-20">
      <div className="max-w-6xl mx-auto space-y-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center space-y-4 max-w-3xl mx-auto">
          {eyebrow && <p className="text-xs text-primary uppercase tracking-wider font-bold">{t(eyebrow)}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t(headline)} <span className="text-primary font-black">{t(headlineAccent)}</span>
          </h2>
          {sub && <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t(sub)}</p>}
          {headerExtra}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8 lg:gap-3 items-center">
          {steps.map((step, i) => (
            <Fragment key={step.num}>
              {i > 0 && (
                <div className="flex justify-center" aria-hidden="true">
                  <ArrowDown className="h-7 w-7 lg:hidden text-primary" />
                  <ArrowRight className="hidden lg:block h-7 w-7 text-primary" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="font-heading text-2xl font-black text-primary shrink-0 leading-none pt-0.5">{step.num}</span>
                  <p className="font-heading font-bold text-lg leading-snug">{t(step.title)}</p>
                </div>
                <step.Screen />
              </motion.div>
            </Fragment>
          ))}
        </div>

        {below}
      </div>
    </section>
  );
}