import { motion } from "framer-motion";
import { Bot, Pencil, X, Send, Sparkles, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import MacVideoWindow from "@/components/home/MacVideoWindow";
import { useLang } from "@/lib/i18n/LanguageContext";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png";

// Screen recording of Sam pitching a song to a Spotify playlist
const SAM_DEMO_VIDEO_URL = "https://media.base44.com/videos/public/69dcf0ecc907e43a438a626b/f25f52b66_copy_EC329DAA-0119-48CB-A58E-6462C3C93327.MOV";

export default function SamInActionSection() {
  const { t } = useLang();
  return (
    <section id="sam-in-action" className="px-4 py-24 border-t border-border scroll-mt-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5 order-2 lg:order-1">
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("SAM In Action")}</p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold leading-tight">
            {t("SAM finds opportunities and writes the pitches. ")}
            <span className="text-primary font-black">{t("You approve. SAM sends.")}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("This is SAM's Desk: a finished pitch, researched and drafted from your real numbers, waiting for your decision.")}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative order-1 lg:order-2">
          <div className="mb-3 sm:-mt-10 lg:-mt-14 relative z-20">
            <p className="font-heading text-5xl sm:text-6xl font-black uppercase tracking-tight text-foreground leading-none">
              {t("Example")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t("of your AI manager at work")}</p>
          </div>
          <img
            src={SAM_IMG}
            alt="SAM, the SoundReady AI manager robot"
            className="absolute -top-12 -right-2 sm:-right-6 h-16 w-auto drop-shadow-xl z-10 pointer-events-none"
          />
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Bot className="h-4 w-4 text-primary" />
              <p className="font-heading font-bold text-sm">{t("SAM's Desk")}</p>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                {t("This week")}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" /> {t("Playlist pitch · drafted from your Spotify data")}
              </span>
              <p className="font-heading font-bold text-sm">{t('Pitch "Midnight Drive" to Chill Vibes Daily (482k followers)')}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("Streams up 34% in two weeks. 62% of listeners in Germany, a direct audience match. Drafted in your voice.")}
              </p>
              <div className="rounded-lg bg-background border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Subject:</span> "Midnight Drive", a late-night lo-fi cut for Chill Vibes Daily
                <br /><br />
                Hi Sofia, I'm Nova, an indie electronic artist. "Midnight Drive" has been quietly climbing in Germany...
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="h-8 gap-1.5">
                  <Send className="h-3.5 w-3.5" /> {t("Approve & send")}
                </Button>
                <Button size="sm" variant="outline" className="h-8 gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> {t("Edit")}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground">
                  <X className="h-3.5 w-3.5" /> {t("Deny")}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border p-3 flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-chart-4 shrink-0" />
              <p className="text-sm text-muted-foreground">
                {t("Also on the desk: a tour-opening pitch for your Berlin date, Nov 14.")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t("Illustrative example: SAM's Desk shows your real drafts, built from your real numbers.")}
            </p>
          </div>
        </motion.div>
      </div>

      {SAM_DEMO_VIDEO_URL && (
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mt-12 space-y-3">
          <p className="font-heading font-black text-4xl sm:text-6xl text-center leading-tight">{t("Your Manager in Action")}</p>
          <p className="text-base sm:text-xl text-muted-foreground text-center">
            {t("Watch SAM automatically pitch a song to a Spotify playlist")}. {t("You simply ")}<span className="text-primary font-semibold">Approve</span> {t("or")} <span className="text-red-400 font-semibold">Deny</span>.
          </p>
          <div aria-hidden="true" className="h-6" />
          <MacVideoWindow videoUrl={SAM_DEMO_VIDEO_URL} title="SAM's Desk" className="mb-10" />
        </motion.div>
      )}
    </section>
  );
}