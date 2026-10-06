import { motion } from "framer-motion";
import { UploadCloud, FolderCheck, Bot, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

const STEPS = [
  {
    icon: UploadCloud,
    color: "text-teal-400",
    title: "Drop a song in",
    desc: "Drag your file into the Vault. Two quick questions and Sam files it — stage, project, artwork, lyrics, all organized.",
  },
  {
    icon: FolderCheck,
    color: "text-blue-400",
    title: "Your career takes shape",
    desc: "The Tracker, your Artist Profile and your connected Spotify and YouTube data build the full picture — every song, show, deal and dollar in one place.",
  },
  {
    icon: Bot,
    color: "text-primary",
    title: "Sam goes to work",
    desc: "Every week Sam studies your numbers and the industry, then drafts the outreach — playlist pitches, tour support, sync leads, deal opportunities.",
  },
  {
    icon: ShieldCheck,
    color: "text-chart-4",
    title: "You approve or deny",
    desc: "Every draft lands in Sam's Desk. Approve, edit or deny in one tap — nothing sends without you. The loop runs again next week.",
  },
];

export default function CareerWorkflowSection() {
  const { t } = useLang();
  return (
    <section className="px-4 py-24 border-t border-border bg-secondary/20">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
          <p className="text-xs text-primary uppercase tracking-widest font-bold">{t("The Weekly Loop")}</p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("One system, working every week.")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("Organization is the foundation. Sam turning it into opportunities is the magic. Here's the loop:")}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-card border border-border p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <span className="font-heading text-xs font-black text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="font-heading font-bold text-sm">{t(s.title)}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(s.desc)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}