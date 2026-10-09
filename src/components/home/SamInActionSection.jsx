import { motion } from "framer-motion";
import { Bot, Pencil, X, Send, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MacVideoWindow from "@/components/home/MacVideoWindow";
import { useLang } from "@/lib/i18n/LanguageContext";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png";

// Screen recording of Sam pitching a song to a Spotify playlist
const SAM_DEMO_VIDEO_URL = "https://media.base44.com/videos/public/69dcf0ecc907e43a438a626b/f25f52b66_copy_EC329DAA-0119-48CB-A58E-6462C3C93327.MOV";

export default function SamInActionSection() {
  const { t } = useLang();
  return (
    <section id="sam-in-action" className="px-4 py-24 scroll-mt-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5 order-2 lg:order-1">
          <p className="text-xs text-primary uppercase tracking-wider font-bold">{t("SAM In Action")}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t("SAM finds opportunities and writes the pitches. ")}
            <span className="text-primary font-black">{t("You approve. SAM sends.")}</span>
          </h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative order-1 lg:order-2">
          <div className="mb-3 sm:-mt-10 lg:-mt-14 relative z-20">
            <p className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-foreground leading-none">
              {t("Example")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t("of your AI manager at work")}</p>
          </div>
          <img
            src={SAM_IMG}
            alt="SAM, the SoundReady AI manager robot"
            className="absolute -top-12 -right-2 sm:-right-6 h-14 sm:h-16 w-auto drop-shadow-xl z-10 pointer-events-none"
          />
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Bot className="h-4 w-4 text-primary" />
              <p className="font-heading font-bold text-sm">{t("SAM's Desk")}</p>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                {t("This week")}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" /> {t("Playlist pitch")}
              </span>
              <p className="font-heading font-bold text-sm">{t('Pitch "Midnight Drive" to Chill Vibes Daily (482k followers)')}</p>
              <div className="rounded-lg bg-background border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Subject:</span> "Midnight Drive", a late-night lo-fi cut for Chill Vibes Daily
                <br />
                Hi Sofia, "Midnight Drive" has been climbing in Germany...
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="h-8 gap-1.5 px-2.5 sm:px-3 text-[11px] sm:text-xs">
                  <Send className="h-3.5 w-3.5" /> {t("Approve & send")}
                </Button>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 sm:px-3 text-[11px] sm:text-xs">
                  <Pencil className="h-3.5 w-3.5" /> {t("Edit")}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2.5 sm:px-3 text-[11px] sm:text-xs text-muted-foreground">
                  <X className="h-3.5 w-3.5" /> {t("Deny")}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {SAM_DEMO_VIDEO_URL && (
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mt-24 space-y-3">
          <p className="font-heading font-black text-4xl sm:text-6xl text-center leading-tight">{t("Your Manager in Action")}</p>
          <p className="text-base sm:text-xl text-muted-foreground text-center">
            {t("Watch SAM automatically pitch a song to a Spotify playlist")}. {t("You simply ")}<span className="text-primary font-semibold">Approve</span> {t("or")} <span className="text-red-400 font-semibold">Deny</span>.
          </p>
          <div aria-hidden="true" className="h-6" />
          <MacVideoWindow videoUrl={SAM_DEMO_VIDEO_URL} title="SAM's Desk" />
          <div className="flex justify-center pt-14">
            <a href="#pricing">
              <Button size="lg" className="gap-2 font-heading font-bold text-base px-10 h-12">
                {t("Start")} <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </motion.div>
      )}
    </section>
  );
}