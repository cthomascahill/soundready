import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

// Product proof: real screenshots of an actual SAM task, from the artist's
// request to what SAM produced. Framed as a recording-style capture.
const TASK_SHOT =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/f25adaed0_Screenshot2026-10-09at103301AM.png";
const RESULT_SHOT =
  "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/befdc5184_Screenshot2026-10-09at121702PM.png";

export default function SamTaskProof() {
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto space-y-4"
    >
      <div className="flex items-center justify-center gap-2 text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <p className="text-xs font-bold uppercase tracking-wider">{t("An actual task, from a real workspace")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            src: TASK_SHOT,
            alt: "An artist's real task to SAM in the Tell Sam workspace",
            caption: "The artist's ask, in plain words",
          },
          {
            src: RESULT_SHOT,
            alt: "SAM's Impact board tallying emails sent, pitches drafted and opportunities found for a real artist",
            caption: "What SAM produced",
          },
        ].map((shot, i) => (
          <figure
            key={shot.src}
            className={`relative rounded-2xl border border-primary/30 bg-card overflow-hidden ring-1 ring-primary/40 shadow-[0_25px_90px_-20px_rgba(74,222,128,0.35)] ${i === 0 ? "md:-rotate-1" : "md:rotate-1"}`}
          >
            <img src={shot.src} alt={shot.alt} className="w-full" />
            <figcaption className="px-4 py-3 border-t border-border">
              <p className="font-heading font-bold text-sm">{t(shot.caption)}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {t("Every result is filed for the artist to review. Nothing sends without approval.")}
      </p>
    </motion.div>
  );
}