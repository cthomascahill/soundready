import { Fragment } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import StepTellSamScreen from "@/components/home/walkthrough/StepTellSamScreen";
import StepResearchScreen from "@/components/home/walkthrough/StepResearchScreen";
import StepApproveScreen from "@/components/home/walkthrough/StepApproveScreen";

const STEPS = [
  {
    num: "1",
    title: "Tell Sam what to do",
    desc: "One plain sentence, like you'd text a manager.",
    Screen: StepTellSamScreen,
  },
  {
    num: "2",
    title: "Sam researches & verifies",
    desc: "Real venues that fit, contacts checked on each venue's own site, quality-checked against your ask.",
    Screen: StepResearchScreen,
  },
  {
    num: "3",
    title: "You approve every draft",
    desc: "Review, edit, or deny. Sam only sends what you approve.",
    Screen: StepApproveScreen,
  },
];

// The Promise: a step-by-step walkthrough of SAM helping an artist find and
// pitch venues — with the artist approving every draft.
export default function SamPromiseWalkthrough() {
  const { t } = useLang();
  return (
    <section id="the-promise" className="px-4 py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto space-y-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("The Promise")}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t("You tell Sam where you want to play. ")}
            <span className="text-primary font-black">{t("Sam finds the venues and writes the emails.")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("Real venues, verified booking contacts and a personalized draft for each — and nothing sends until you approve it.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8 lg:gap-3 items-center">
          {STEPS.map((step, i) => (
            <Fragment key={step.num}>
              {i > 0 && (
                <div className="flex justify-center" aria-hidden="true">
                  <ArrowDown className="h-7 w-7 lg:hidden text-primary" />
                  <ArrowRight className="hidden lg:block h-7 w-7 text-primary" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="font-heading text-2xl font-black text-primary shrink-0 leading-none pt-0.5">{step.num}</span>
                  <div>
                    <p className="font-heading font-bold">{t(step.title)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t(step.desc)}</p>
                  </div>
                </div>
                <step.Screen />
              </motion.div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}