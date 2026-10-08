import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

const BEFORE_IMG =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/54e270f35_IMG_2118.JPG";
const AFTER_IMG =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/2fea0ae19_IMG_7601.jpg";

export default function MattCormanSection() {
  const { t } = useLang();

  const shot = (img, alt, listeners, highlight) => (
    <div className="flex-1 min-w-0">
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
      <div className="max-w-5xl mx-auto space-y-12 text-center">
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
          className="flex flex-col sm:flex-row items-center gap-6 sm:gap-4"
        >
          {shot(BEFORE_IMG, "Matt Corman's Spotify profile with 54,647 monthly listeners", "54,647 monthly listeners", false)}

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="shrink-0 rotate-90 sm:rotate-0"
          >
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ x: { repeat: Infinity, duration: 1.4, ease: "easeInOut" } }}
              >
                <ArrowRight className="h-6 w-6 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          {shot(AFTER_IMG, "Matt Corman's Spotify profile with 1.2 million monthly listeners", "1.2M monthly listeners", true)}
        </motion.div>
      </div>
    </section>
  );
}