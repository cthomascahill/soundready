import { motion } from "framer-motion";
import { HandCoins, TrendingUp, Wand2, ListChecks, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";

// Real screenshots of the platform: Sam's task workspace and the Deals desk
const TELL_SAM_SHOT =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/f25adaed0_Screenshot2026-10-09at103301AM.png";
const DEALS_SHOT =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/aca367e72_Screenshot2026-10-09at103319AM.png";

const SHOTS = [
  {
    src: TELL_SAM_SHOT,
    alt: "SoundReady's Tell Sam workspace with the task composer and usage meter",
    caption: "Tell Sam what to do",
    blurb: "Give Sam any task in plain words. Sam researches, drafts and reports back.",
    tilt: "lg:-rotate-1",
  },
  {
    src: DEALS_SHOT,
    alt: "SoundReady's Deals desk showing the catalog advance slider and deal outreach",
    caption: "Deals, advances and outreach",
    blurb: "Slide your catalog revenue and see what an advance could be worth upfront.",
    tilt: "lg:rotate-1",
  },
];

const FEATURES = [
  { icon: HandCoins, text: "Get an advance on your future royalties" },
  { icon: TrendingUp, text: "See what your catalog is worth" },
  { icon: Wand2, text: "Give Sam any task, in plain words" },
  { icon: ListChecks, text: "Approve every pitch before it sends" },
];

export default function PlatformShowcaseSection() {
  const { t } = useLang();
  return (
    <section className="relative px-4 py-16 overflow-hidden">
      {/* Soft ambient gradient glows behind the screenshots */}
      <div className="absolute top-1/4 -left-64 h-[620px] w-[620px] rounded-full bg-primary/15 blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-64 h-[560px] w-[560px] rounded-full bg-chart-2/10 blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="relative max-w-6xl mx-auto space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("The Platform")}</p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold leading-tight">
            {t("Your whole career, ")}<span className="text-primary font-black">{t("one workspace")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("Sam is just one aspect of SoundReady. Look through our 30+ tools to manage your music career.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {SHOTS.map((shot, i) => (
            <div key={shot.src} className={`relative group ${shot.span || ""}`}>
              {/* Neon outer glow behind the card, Too Lost style; brightens on hover */}
              <div className="absolute -inset-4 sm:-inset-6 rounded-3xl bg-primary/25 blur-3xl pointer-events-none transition-colors duration-300 group-hover:bg-primary/40" />
              <motion.figure
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-2xl border border-primary/30 bg-card overflow-hidden ring-1 ring-primary/40 shadow-[0_25px_90px_-20px_rgba(74,222,128,0.45)] ${shot.tilt} lg:hover:rotate-0 hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-300 ease-out`}
              >
              <img src={shot.src} alt={shot.alt} className="w-full" />
              <figcaption className="p-4 sm:p-5 space-y-1 border-t border-border">
                <p className="font-heading font-bold">{t(shot.caption)}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(shot.blurb)}</p>
              </figcaption>
              </motion.figure>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 sm:gap-3 rounded-xl bg-card border border-border p-3 sm:p-4"
            >
              <f.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" />
              <span className="text-xs sm:text-sm font-medium">{t(f.text)}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <a href="#pricing">
            <Button size="lg" className="gap-2 font-heading font-bold text-base px-8 h-12">
              {t("See Plans")} <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}