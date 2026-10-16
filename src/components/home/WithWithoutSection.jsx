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
  "You're constantly wondering how other artists are growing.",
  "You struggle to get booked, reach playlists, and find new fans.",
  "You're overwhelmed doing everything yourself.",
  "Music still feels like a dream you're chasing.",
];

const WITH = [
  "You're a professional musician building a real career.",
  "Your songs are reaching new listeners and growing your fanbase.",
  "Every release has a strategy designed to build momentum.",
  "You're getting playlist opportunities, booking shows, and making industry connections.",
  "You have a digital manager working behind the scenes while you focus on creating.",
  "You're no longer just making music. You're building the career you've always imagined.",
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
      <span className="text-sm sm:text-base leading-relaxed">{t(text)}</span>
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
            {t("From struggling independent artist")}
            <br />
            <span className="text-primary">{t("to professional musician")}</span>
          </h2>
        </motion.div>

        {/* Two worlds, side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          {/* LEFT: without SoundReady */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card/60 p-5 sm:p-8 flex flex-col"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              {t("Without SoundReady")}
            </p>
            <div className="rounded-xl overflow-hidden border border-border mb-6 bg-background/40">
              <img
                src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/64502b47c_generated_image.png"
                alt="An overwhelmed independent artist surrounded by folders, unanswered emails, and unfinished releases"
                className="w-full aspect-[16/9] object-cover opacity-80 saturate-[0.6]"
                loading="lazy"
              />
            </div>
            <ul className="space-y-3 sm:space-y-3.5 text-muted-foreground">
              {WITHOUT.map((line, i) => item(line, i, false))}
            </ul>
          </motion.div>

          {/* RIGHT: with SoundReady */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl border border-primary/40 bg-card p-5 sm:p-8 flex flex-col shadow-[0_0_50px_-10px_rgba(74,222,128,0.35)]"
          >
            <div className="absolute -inset-1.5 rounded-3xl bg-primary/15 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col h-full">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                {t("With SoundReady")}
              </p>
              <div className="rounded-xl overflow-hidden border border-primary/30 mb-6 bg-background/40">
                <img
                  src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/f0c3bafd3_generated_image.png"
                  alt="The same artist as a successful musician: growing streams, booked shows, new fans, and opportunities rolling in while SoundReady handles the work"
                  className="w-full aspect-[16/9] object-cover"
                  loading="lazy"
                />
              </div>
              <ul className="space-y-3 sm:space-y-3.5 text-foreground">
                {WITH.map((line, i) => item(line, i, true))}
              </ul>
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