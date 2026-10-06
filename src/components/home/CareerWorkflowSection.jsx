import { motion } from "framer-motion";
import { UserRound, UploadCloud, Bot, TrendingUp } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

const STEPS = [
  {
    icon: UserRound,
    color: "text-teal-400",
    title: "Connect your profile",
    desc: "Link Spotify and YouTube, tell Sam who you are. Sam learns your real numbers.",
  },
  {
    icon: UploadCloud,
    color: "text-blue-400",
    title: "Upload & track your music",
    desc: "Drop songs in your Vault. Track every step from idea to distribution.",
  },
  {
    icon: Bot,
    color: "text-primary",
    title: "Grow with Sam",
    desc: "Sam finds opportunities and pitches you for them every week. You approve or deny.",
  },
  {
    icon: TrendingUp,
    color: "text-chart-4",
    title: "Review results & income",
    desc: "Streams, shows, royalties and deals — one picture of what's working.",
  },
];

export default function CareerWorkflowSection() {
  const { t } = useLang();
  return (
    <section id="how-it-works" className="px-4 py-24 border-t border-border bg-secondary/20">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
          <p className="text-xs text-primary uppercase tracking-widest font-bold">{t("How It Works")}</p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold">{t("Four steps. Every week.")}</h2>
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