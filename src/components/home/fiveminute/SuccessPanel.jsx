import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";

const SAM_IMG =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/b7f9a17dc_generated_f31f1bbd.png";

// The 00:00 grand finale: SAM arrives with the next-chapter message
// and the signup CTA. Feels like completing a milestone, not a party.
export default function SuccessPanel({ onStart }) {
  const { t } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-2xl border border-primary/40 bg-card p-6 sm:p-10 overflow-hidden"
    >
      {/* Soft green halo behind the panel */}
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-center">
        <motion.img
          src={SAM_IMG}
          alt="SAM, the SoundReady Artist Manager"
          className="h-36 sm:h-48 lg:h-56 w-auto mx-auto drop-shadow-2xl"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.15 }}
        />
        <div className="text-center lg:text-left space-y-4">
          <h3 className="font-heading text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t("Welcome to the next chapter")}
            <br />
            <span className="text-primary">{t("of your music career")}</span>
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t(
              "Your music is organized. Your strategy is ready. Your manager is working. Now it's time to become the artist you've always dreamed of being."
            )}
          </p>
          <Button
            size="lg"
            onClick={onStart}
            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 font-heading font-black text-sm sm:text-base gap-2"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("Start Building My Music Career - Free")}
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}