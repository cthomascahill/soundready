import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { hasAIManager } from "@/lib/tier";
import { useToast } from "@/components/ui/use-toast";
import MemoryAddForm from "@/components/maya/MemoryAddForm";
import MemoryEntryList from "@/components/maya/MemoryEntryList";
import SamLogo from "@/components/SamLogo";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Target, SlidersHorizontal, ShieldAlert, Mail, ChevronRight, Loader2, Disc3 } from "lucide-react";

// The four areas the user defines upfront — Sam reads all of these before every suggestion
const SECTIONS = [
  {
    category: "goals",
    title: "Goals",
    icon: Target,
    description: "What you're working toward. Sam shapes every plan around these.",
    placeholder: "e.g. Reach 10,000 monthly listeners in 6 months",
    suggestions: [
      "Reach 10,000 monthly listeners in 6 months",
      "Book 10 paid shows this year",
      "Land my first sync placement",
      "Release my first EP by summer",
    ],
  },
  {
    category: "preferences",
    title: "Management Preferences",
    icon: SlidersHorizontal,
    description: "How you like to work and what you want Sam to prioritize.",
    placeholder: "e.g. I prefer festivals over club gigs",
    suggestions: [
      "I prefer festivals over club gigs",
      "Prioritize placements over playlists",
      "Only pitch me opportunities that pay",
      "I want to approve every draft before it's sent",
    ],
  },
  {
    category: "constraints",
    title: "Constraints",
    icon: ShieldAlert,
    description: "Your hard limits — time, money, geography. Sam won't suggest past these.",
    placeholder: "e.g. I can only tour regionally (Southeast)",
    suggestions: [
      "I can only tour regionally (Southeast)",
      "My recording budget is capped at $500 per song",
      "I have a day job — weekdays only",
      "No shows further than 4 hours from home",
    ],
  },
  {
    category: "projects",
    title: "Projects & Collaborators",
    icon: Disc3,
    description: "Details about your projects, collaborators, and release plans — so you never have to repeat yourself.",
    placeholder: "e.g. My EP 'Midnight Drive' drops March 14, Rico is mixing it",
    suggestions: [
      "My EP 'Midnight Drive' drops March 14 — Rico is mixing it",
      "The album has 8 tracks with 2 features",
      "I record at Sound City with engineer Dana",
      "The next single needs artwork before we submit it",
    ],
  },
  {
    category: "outreach_style",
    title: "Outreach Style",
    icon: Mail,
    description: "How Sam should sound when they write pitches and emails on your behalf.",
    placeholder: "e.g. Keep emails short and confident",
    suggestions: [
      "Keep emails short and confident",
      "Always mention my city and genre",
      "No emojis in professional emails",
      "Write like a manager, not a fan",
    ],
  },
];

const shortKey = (value) => (value.length > 60 ? value.slice(0, 57) + "…" : value);

export default function MayaProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const aiManager = hasAIManager(user);

  useEffect(() => {
    if (!aiManager || !user?.id) { setLoading(false); return; }
    base44.entities.MayaMemory.filter({ user_id: user.id }, "-created_date", 100)
      .then(setMemories)
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, [user, aiManager]);

  const showError = () =>
    toast({ title: "Couldn't save that", description: "Please try again in a moment.", variant: "destructive" });

  // Everything defined here is a confirmed fact Sam applies everywhere
  const addMemory = async (category, value) => {
    try {
      const created = await base44.entities.MayaMemory.create({
        user_id: user.id,
        category,
        key: shortKey(value),
        value,
        status: "confirmed",
        source: "profile",
      });
      setMemories((prev) => [created, ...prev]);
    } catch {
      showError();
    }
  };

  const updateMemory = async (entry, value) => {
    try {
      const updated = await base44.entities.MayaMemory.update(entry.id, {
        value,
        key: shortKey(value),
      });
      setMemories((prev) => prev.map((m) => (m.id === entry.id ? updated : m)));
    } catch {
      showError();
    }
  };

  const deleteMemory = async (entry) => {
    try {
      await base44.entities.MayaMemory.delete(entry.id);
      setMemories((prev) => prev.filter((m) => m.id !== entry.id));
    } catch {
      showError();
    }
  };

  // ── Non-AI-Manager: upsell ──────────────────────────────────────────────
  if (!aiManager) {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="max-w-md mx-auto rounded-2xl border border-primary/20 bg-card p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <p className="font-heading font-bold text-lg">Sam's profile is part of the AI Manager plan</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Define your goals, preferences, and constraints once — and Sam factors them into every suggestion, draft, and plan they make.
          </p>
          <Link to="/pricing-account">
            <Button className="w-full gap-2 font-semibold">
              <Zap className="h-4 w-4" /> Start Manager — $59/mo
            </Button>
          </Link>
          <p className="text-[10px] text-muted-foreground/60">Cancel anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">SAM · SoundReady Artist Manager</p>
          <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
            <SamLogo className="h-8 w-8 text-primary" /> Sam's Profile
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Tell Sam what matters most to you before they make a single suggestion. Everything you define here becomes a
            confirmed fact Sam applies to every plan, draft, and recommendation.
          </p>
          <Link to="/maya-desk" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            Back to Sam's Desk <ChevronRight className="h-3 w-3" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-16">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading what Sam knows about you…
          </div>
        ) : (
          <div className="space-y-6">
            {SECTIONS.map((section) => {
              const entries = memories.filter((m) => m.category === section.category && m.status !== "dismissed");
              return (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-card border border-border p-5 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <section.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-heading font-bold">{section.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{section.description}</p>
                    </div>
                  </div>
                  {entries.length > 0 && (
                    <MemoryEntryList entries={entries} onUpdate={updateMemory} onDelete={deleteMemory} />
                  )}
                  <MemoryAddForm
                    suggestions={entries.length >= 2 ? [] : section.suggestions}
                    onAdd={(value) => addMemory(section.category, value)}
                    placeholder={section.placeholder}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}