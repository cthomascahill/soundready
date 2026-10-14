import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Mail, Clock3, Send } from "lucide-react";
import SamLogo from "@/components/SamLogo";
import { useLang } from "@/lib/i18n/LanguageContext";

// Product proof: a light-mode mock of the artist's ask in the Tell Sam
// composer, paired with a readable example of SAM's actual output, one
// verified venue match and the drafted pitch waiting for approval.
function TaskAskMock() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden text-left pointer-events-none select-none shadow-xl">
      <div className="px-5 pt-5 pb-3 space-y-3">
        <div className="flex items-center gap-2.5">
          <SamLogo className="h-5 w-5 text-primary" />
          <p className="font-heading font-bold text-sm">Tell Sam what to do</p>
        </div>
        <div className="rounded-xl bg-secondary/40 border border-border p-4 text-sm leading-relaxed min-h-[96px]">
          Find indie-rock rooms in Chicago that fit my sound and draft the booking emails.
        </div>
        <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2 text-xs text-muted-foreground">
          Who or where? (optional), rooms within two hours of Chicago
        </div>
      </div>
      <div className="flex items-center justify-end px-5 py-3.5 border-t border-border bg-secondary/30">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md px-4 py-2">
          <Send className="h-3.5 w-3.5" /> Give Sam the task
        </span>
      </div>
    </div>
  );
}

export default function SamTaskProof() {
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-5xl mx-auto space-y-4"
    >
      <div className="flex items-center justify-center gap-2 text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <p className="text-xs font-bold uppercase tracking-wider">{t("An actual task, from a real workspace")}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* The ask */}
        <figure className="relative rounded-2xl border border-primary/30 bg-card overflow-hidden ring-1 ring-primary/40 shadow-xl lg:-rotate-1">
          <div className="p-3">
            <TaskAskMock />
          </div>
          <figcaption className="px-4 py-3 border-t border-border">
            <p className="font-heading font-bold text-sm">{t("The artist's ask, in plain words")}</p>
          </figcaption>
        </figure>

        {/* The output: one venue match + the drafted pitch */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3 lg:rotate-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading font-black text-base">The Empty Bottle</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Chicago, IL · Cap ~450</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                Verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>booking@emptybottle.com, found on their booking page</span>
            </div>
            <p className="text-sm leading-relaxed">
              Books indie and rock on weeknights, two hours from your top market. Your streamed-most city is Chicago.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-secondary/60 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-heading font-bold text-sm">{t("SAM's draft, ready to review")}</p>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                <Clock3 className="h-3 w-3" /> Awaiting approval
              </span>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 space-y-2">
              <p className="text-sm font-semibold">Subject: Booking inquiry, weeknight bill, April dates</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hi, I'm an indie-rock artist with 670K monthly listeners, and Chicago is one of my top three cities.
                I'd love to open a weeknight bill. Press kit attached. Either way, thanks for listening.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{t("Approve, edit, or deny, nothing sends without you.")}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}