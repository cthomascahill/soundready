import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import { Button } from "@/components/ui/button";
import ProspectPicker from "@/components/deals/ProspectPicker";
import OutreachList from "@/components/deals/OutreachList";
import {
  Bot, ArrowRight, CheckCircle2, Disc3, Package, Clapperboard,
  Lock, Zap, ChevronLeft,
} from "lucide-react";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/d124f0929_generated_f10ed4b3.png";

const CATEGORIES = [
  { id: "record_label", label: "Record Labels", icon: Disc3, blurb: "Indie and mid-size labels that sign artists at your level, in your genre." },
  { id: "distributor", label: "Distributors", icon: Package, blurb: "Distribution and label-services companies suited to your catalog." },
  { id: "sync", label: "Sync Opportunities", icon: Clapperboard, blurb: "Sync houses and music libraries accepting artist submissions." },
];

const STEPS = [
  {
    title: "Sam reviews your catalog",
    desc: "Your streams, releases and vault become your pitch. Sam knows exactly what makes your catalog valuable to a label.",
  },
  {
    title: "Sam finds the right companies",
    desc: "Labels, distributors, sync houses — Sam targets companies that work with artists at your traction level, with verified public contacts. Not blast lists.",
  },
  {
    title: "Sam drafts the outreach",
    desc: "A real pitch with your real numbers lands right here. Nothing sends until you approve it.",
  },
  {
    title: "Sam runs the follow-up",
    desc: "Replies, nudges and next steps get tracked for you, so a warm conversation never goes cold again.",
  },
];

export default function DealsOutreach() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    base44.entities.DealOutreach.filter({ user_id: user.id }, "-created_date", 100)
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [user]);

  const onCreated = (created) => setRecords(prev => [...created, ...prev]);
  const onUpdated = (updated) => setRecords(prev => prev.map(r => (r.id === updated.id ? updated : r)));

  if (!hasAIManager(user)) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card p-8 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <p className="font-heading font-bold text-lg">Sam's deal outreach is part of the AI Manager plan</p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Sam researches labels, distributors and sync houses, drafts the pitches, and sends them once you approve — nothing goes out without you.
        </p>
        <div className="flex justify-center">
          <Link to="/pricing-account">
            <Button className="gap-2 font-semibold"><Zap className="h-4 w-4" /> Start Manager — $60/mo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeRecords = active ? records.filter(r => r.category === active.id) : [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 relative overflow-hidden">
        <img
          src={SAM_IMG}
          alt="Sam, the SoundReady AI manager robot"
          className="hidden sm:block pointer-events-none absolute -right-2 bottom-0 h-44 w-auto drop-shadow-xl"
        />
        <div className="relative max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
            <Bot className="h-3.5 w-3.5" /> Sam's Deal Outreach
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
            Sam can outbound to labels, distributors and sync houses <span className="text-primary">for you.</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Pick a lane below. Sam researches real companies with verified public contacts, drafts the pitch from your real numbers, and sends it only after you approve it.
          </p>
          <Button size="lg" className="gap-2 font-semibold" onClick={() => setOpen(true)}>
            Ask Sam to start outreach <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category chooser */}
      {open && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map(cat => {
            const count = records.filter(r => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat)}
                className={`text-left rounded-xl border p-5 space-y-3 transition-colors ${
                  active?.id === cat.id
                    ? "border-primary/40 bg-primary/5"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <cat.icon className="h-4 w-4 text-primary" />
                  </div>
                  {count > 0 && (
                    <span className="text-[10px] font-bold text-muted-foreground">{count} tracked</span>
                  )}
                </div>
                <p className="font-heading font-bold text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.blurb}</p>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Active category workspace */}
      {active && (
        <div className="space-y-5 rounded-2xl border border-border bg-secondary/20 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setActive(null)} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" /> All deal types
            </Button>
            <p className="font-heading font-bold flex items-center gap-2">
              <active.icon className="h-4 w-4 text-primary" /> {active.label}
            </p>
          </div>
          <OutreachList records={activeRecords} loading={loading} onUpdated={onUpdated} />
          <ProspectPicker category={active} onCreated={onCreated} />
        </div>
      )}

      {/* How it works */}
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

      <div className="rounded-xl border border-border bg-secondary/40 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          You keep ownership of everything. Sam only opens conversations using publicly listed contact info — you approve every pitch before it goes out, and you walk away from any deal you don't like.
        </p>
      </div>
    </div>
  );
}