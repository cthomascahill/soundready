import { motion } from "framer-motion";
import { Bot, Mic } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Your job vs SoundReady's job: let the artist make music while the
// busywork gets handled behind the scenes.
export default function JobSplitSection() {
  const { t } = useLang();

  return (
    <section className="px-4 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto rounded-3xl border border-border bg-card px-5 py-12 sm:px-10 sm:py-16 space-y-10 sm:space-y-14"
      >
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            {t("You weren't born to send emails")}
            <br />
            <span className="text-primary">{t("You were born to make music")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("Stop being your own manager, booking agent, release strategist, and administrative assistant.")}
          </p>
        </div>

        {/* The division of labor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* YOUR JOB */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-secondary/30 p-6 sm:p-8 space-y-4"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">
              {t("Your job")}
            </p>
            <Mic className="h-8 w-8 text-foreground/70" />
            <h3 className="font-heading text-2xl sm:text-3xl font-black leading-tight">
              {t("Create incredible music.")}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("Write, record, perform, and connect with your fans.")}
            </p>
          </motion.div>

          {/* SOUNDREADY'S JOB */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl border border-primary/40 bg-primary/5 p-6 sm:p-8 space-y-4 shadow-[0_0_50px_-16px_rgba(74,222,128,0.45)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t("SoundReady's job")}
            </p>
            <Bot className="h-8 w-8 text-primary" />
            <h3 className="font-heading text-2xl sm:text-3xl font-black leading-tight">
              {t("Handle the busywork.")}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("Organize songs, build plans, research opportunities, prepare outreach, and follow up with your approval.")}
            </p>
          </motion.div>
        </div>

        {/* Footer line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center italic text-sm sm:text-base text-muted-foreground"
        >
          {t("Finally, a music career that doesn't require you to do everything alone.")}
        </motion.p>
      </motion.div>
    </section>
  );
}