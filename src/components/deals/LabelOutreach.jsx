import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Sam reviews your catalog",
    desc: "Your streams, releases and vault become your pitch. Sam knows exactly what makes your catalog valuable to a label.",
  },
  {
    title: "Sam finds the right labels",
    desc: "Indie or major — Sam targets labels that sign artists at your traction level and in your genre, not blast lists.",
  },
  {
    title: "Sam drafts the outreach",
    desc: "A real pitch with your real numbers lands in Sam's Desk. Nothing sends until you approve or deny it.",
  },
  {
    title: "Sam runs the follow-up",
    desc: "Replies, nudges and next steps get tracked for you, so a warm conversation never goes cold again.",
  },
];

export default function LabelOutreach() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 relative overflow-hidden">
        <img
          src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png"
          alt="Sam, the SoundReady AI manager robot"
          className="hidden sm:block pointer-events-none absolute -right-2 bottom-0 h-44 w-auto drop-shadow-xl"
        />
        <div className="relative max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
            <Bot className="h-3.5 w-3.5" /> Sam's Label Outreach
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
            Sam can outbound to record labels <span className="text-primary">for you.</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Getting a record deal is a numbers game — most artists never play it because cold outreach to labels is a full-time job. Sam plays it for you: every week, Sam works your catalog into label-ready pitches and sends you the drafts to approve.
          </p>
          <Link to="/maya-desk">
            <Button size="lg" className="gap-2 font-semibold">
              Ask Sam to start outreach <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-card border border-border p-5 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="font-heading font-bold text-sm">{s.title}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-secondary/40 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          You keep ownership of everything. Sam only opens conversations — you approve every pitch before it goes out, and you walk away from any deal you don't like.
        </p>
      </div>
    </div>
  );
}