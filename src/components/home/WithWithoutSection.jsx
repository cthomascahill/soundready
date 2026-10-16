import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";

// The emotional before/after: the same artist, stuck alone vs. building a
// real career with SoundReady handling the work behind the scenes.
const WITHOUT = [
  "You're making great music, but nobody's hearing it.",
  "You aren't making enough money off music.",
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
    <section className="px-4 py-20 sm:py-28 overflow-hidden">
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
            className="flex flex-col"
          >
            <motion.div
              className="relative w-full rounded-xl overflow-hidden"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/45cb80875_generated_image.png"
                alt="A struggling independent artist at night: message bubbles above his head reading did we even get 1000 streams? and we aren't growing, plus a text saying Yoo I can't find mix #2"
                className="w-full h-auto block"
                loading="lazy"
              />
            </motion.div>
            <div className="pt-5 sm:pt-8 flex flex-col flex-1">
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
            className="relative flex flex-col"
          >
            <motion.div
              className="relative w-full rounded-xl overflow-hidden ring-1 ring-primary/20"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute -inset-10 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
              <img
                src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/6d44bdd52_generated_image.png"
                alt="The same artist in a bright tidy studio: a Streams are up 150% this month! message above his head, a playlist pitch approved notification, and SAM the robot manager holding up a New Tour Opportunity paper"
                className="relative w-full h-auto block"
                loading="lazy"
              />
            </motion.div>
            <div className="pt-5 sm:pt-8 flex flex-col flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                {t("With SoundReady")}
              </p>
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
            {t("Start Free")}
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("Start with 3 songs. No card required.")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}