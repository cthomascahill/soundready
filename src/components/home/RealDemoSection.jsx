import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n/LanguageContext";

/**
 * Real demonstration: a screen recording of the actual flow — files dropped
 * into the Vault and a SAM pitch awaiting approval. Sits right after the
 * animated walkthrough so the promise is followed by proof.
 */
export default function RealDemoSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs text-primary uppercase tracking-widest font-bold">
            {t("See it working")}
          </p>
          <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight leading-[1.02]">
            {t("Not a promise. The actual product.")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("Drop your files in, watch them organize themselves, and review the pitch SAM prepared — before you approve anything.")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden ring-1 ring-border shadow-2xl bg-card"
        >
          <video
            src="https://media.base44.com/videos/public/69dcf0ecc907e43a438a626b/e1bba3f6d_Real_App_Demo.mp4"
            className="w-full aspect-video bg-black"
            controls
            autoPlay
            muted
            loop
            playsInline
          />
        </motion.div>
      </div>
    </section>
  );
}