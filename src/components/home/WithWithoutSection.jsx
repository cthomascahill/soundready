import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";

// The emotional before/after: the same artist, stuck alone vs. building a
// real career with SoundReady handling the work behind the scenes.
const WITHOUT = [
  "You're making great music, but nobody's hearing it.",
  "You release songs that barely get any attention.",
  "You're overwhelmed doing everything yourself.",
  "Music still feels like a dream you're chasing.",
];

const WITH = [
  "You're a professional musician building a real career.",
  "Your songs are reaching new listeners and growing your fanbase.",
  "You're getting playlist opportunities, booking shows, and making industry connections.",
  "You have a digital manager working behind the scenes while you focus on creating.",
];

export default function WithWithoutSection() {
  const { t } = useLang();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const item = (text, i, good) => (
    <motion.li
      key={text}
      initial={{ opacity: 0, x: good ? 12 : -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + i * 0.06 }}
      className="flex items-start gap-2.5"
    >
      {good ? (
        <Check className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 text-primary" />
      ) : (
        <X className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 text-destructive/80" />
      )}
      <span className="text-base sm:text-lg font-bold leading-snug">{t(text)}</span>
    </motion.li>
  );

  return (
    <section className="px-4 py-20 sm:py-28 border-t border-border overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        {/* Headline: the transformation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <h2 className="font-heading text-4xl sm:text-6xl font-black tracking-tight leading-[1.02]">
            {t("It only takes 5 minutes to change your career")}
            <br />
            <span className="text-primary">{t("change your life")}</span>
          </h2>
        </motion.div>

        {/* Two worlds, side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          {/* LEFT: without SoundReady */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card/60 overflow-hidden flex flex-col"
          >
            <img
              src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/a20293f7c_generated_image.png"
              alt="A struggling independent artist at night: a landlord text about missed rent, an empty inbox, a declining streams graph and a post with zero likes"
              className="w-full aspect-[16/11] sm:aspect-[16/10] object-cover"
              loading="lazy"
            />
            <div className="p-5 sm:p-8 flex flex-col flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                {t("Without SoundReady")}
              </p>
              <ul className="space-y-3 sm:space-y-3.5 text-muted-foreground">
                {WITHOUT.map((line, i) => item(line, i, false))}
              </ul>
            </div>
          </motion.div>

          {/* RIGHT: with SoundReady */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl border border-primary/40 bg-card overflow-hidden flex flex-col shadow-[0_0_50px_-10px_rgba(74,222,128,0.35)]"
          >
            <div className="absolute -inset-1.5 rounded-3xl bg-primary/15 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col h-full overflow-hidden rounded-2xl">
              <img
                src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/9474ac2b9_generated_image.png"
                alt="The same artist transformed and winning: cash in hand, a tour inquiry email, a label signing offer, a SAM text about streams up 150% and a post flooded with likes"
                className="w-full aspect-[16/11] sm:aspect-[16/10] object-cover"
                loading="lazy"
              />
              <div className="p-5 sm:p-8 flex flex-col flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                  {t("With SoundReady")}
                </p>
                <ul className="space-y-3 sm:space-y-3.5 text-foreground">
                  {WITH.map((line, i) => item(line, i, true))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA: start the transformation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3 pt-2"
        >
          <Button
            size="lg"
            className="gap-2 font-heading font-bold text-sm sm:text-base px-6 sm:px-8 h-12"
            onClick={() => { window.location.href = isAuth ? "/dashboard" : "/register"; }}
          >
            <Sparkles className="h-4 w-4" />
            {t("Start Your Music Career Transformation, Free")}
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("Start with 3 songs. No card required.")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}