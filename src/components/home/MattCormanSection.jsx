import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

const BEFORE_IMG =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/433528c43_IMG_2118.JPG";
const AFTER_IMG =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/eeb6b43c8_IMG_7601.jpg";

// The long green arrow between the two profiles, with a head that glides
// back and forth along the shaft
const GrowthArrow = () => (
  <div className="relative flex items-center w-full sm:w-44 lg:w-56 shrink-0">
    <div className="h-1.5 w-full rounded-full bg-primary" />
    <motion.div
      className="absolute -top-4 left-0"
      animate={{ x: ["0%", "100%", "0%"] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: "fit-content" }}
    >
      <MoveRight className="h-10 w-10 text-primary" strokeWidth={2.5} />
    </motion.div>
  </div>
);

export default function MattCormanSection() {
  const { t } = useLang();

  const shot = (img, alt, label, listeners, highlight) => (
    <div className="flex-1 min-w-0">
      <p className={`text-center mb-3 font-heading text-2xl sm:text-3xl font-black tracking-tight ${highlight ? "text-primary" : "text-muted-foreground"}`}>
        {t(label)}
      </p>
      <div className={`rounded-2xl border overflow-hidden shadow-xl ${highlight ? "border-primary/40 ring-2 ring-primary/30" : "border-border"}`}>
        <img src={img} alt={alt} className="w-full h-auto block" />
      </div>
      <p className={`text-center mt-3 text-xs font-bold uppercase tracking-widest ${highlight ? "text-primary" : "text-muted-foreground"}`}>
        {t(listeners)}
      </p>
    </div>
  );

  return (
    <section className="px-4 py-24 border-t border-border">
      <div className="max-w-6xl mx-auto space-y-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <p className="text-xs text-primary uppercase tracking-wider font-bold">
            {t("The formula, proven first")}
          </p>
          <h2 className="font-heading text-4xl sm:text-6xl font-black tracking-tight">
            {t("Created by ")}
            <span className="text-primary">{t("Matt Corman")}</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("The exact formula Matt used to take himself from zero monthly listeners to over one million. 100% independent. Now it's built into every corner of SoundReady.")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10 lg:gap-16"
        >
          {shot(BEFORE_IMG, "Matt Corman's Spotify profile with 54,647 monthly listeners", "From this", "54,647 monthly listeners", false)}

          <div className="flex flex-col items-center gap-4 rotate-90 sm:rotate-0">
            <p className="font-heading text-xl sm:text-2xl font-black text-primary whitespace-nowrap">
              {t("+1,000,000 monthly listeners")}
            </p>
            <GrowthArrow />
          </div>

          {shot(AFTER_IMG, "Matt Corman's Spotify profile with 1.2 million monthly listeners", "To this", "1.2M monthly listeners", true)}
        </motion.div>
      </div>
    </section>
  );
}