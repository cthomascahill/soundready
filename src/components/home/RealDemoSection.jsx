import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import RealDemoPlayer from "@/components/home/RealDemoPlayer";

const STEPS = ["Drop", "Organize", "Approve"];

/**
 * Real demonstration: the actual product UI, rendered live — files dropped
 * into the Vault, songs organized with their versions, and a SAM pitch
 * awaiting approval. Not a recording; the interface itself plays the flow.
 */
export default function RealDemoSection() {
  const { t } = useLang();
  const [stage, setStage] = useState(0);

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
            {t("The real SoundReady interface, playing the flow live: drop your files, watch them organize, review the pitch SAM prepared — nothing sends without your approval.")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden ring-1 ring-border shadow-2xl bg-card">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/60">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              </div>
              <div className="ml-2 flex-1 max-w-xs rounded-md bg-background/70 border border-border px-3 py-1 text-[11px] text-muted-foreground truncate">
                soundready.ai/dashboard
              </div>
            </div>
            <RealDemoPlayer onStageChange={setStage} />
          </div>
        </motion.div>

        {/* The three beats of the flow, highlighted as they play */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
                stage === i
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", stage === i ? "bg-primary" : "bg-muted-foreground/40")} />
              {t(label)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}