import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SEO from "@/components/SEO";
import ChecklistSection from "@/components/releasekit/ChecklistSection";
import PitchTemplateSection from "@/components/releasekit/PitchTemplateSection";
import PitchExampleSection from "@/components/releasekit/PitchExampleSection";
import { DEFAULT_CHECKLIST } from "@/lib/releaseChecklistDefaults";

// The free Release Kit: a checkable release checklist plus the Spotify
// playlist pitch template. Free for every artist, forever.
export default function ReleaseKit() {
  const { user } = useAuth();
  const [items, setItems] = useState(null); // null = loading
  const seededRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const existing = await base44.entities.ReleaseChecklistItem.filter(
        { created_by_id: user.id }, "sort_order", 200
      );
      if (!existing.length && !seededRef.current) {
        // First visit: seed the default checklist for this artist
        seededRef.current = true;
        await base44.entities.ReleaseChecklistItem.bulkCreate(
          DEFAULT_CHECKLIST.map((d, i) => ({ ...d, user_id: user.id, done: false, sort_order: i }))
        );
        setItems(await base44.entities.ReleaseChecklistItem.filter(
          { created_by_id: user.id }, "sort_order", 200
        ));
      } else {
        setItems(existing);
      }
    })().catch(() => setItems([]));
  }, [user?.id]);

  const toggle = (item) => {
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, done: !it.done } : it)));
    base44.entities.ReleaseChecklistItem.update(item.id, { done: !item.done }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <SEO
        title="Release Kit"
        description="A free release checklist and the Spotify playlist pitch template, free for every artist."
      />
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Free, forever</p>
          <h1 className="font-heading text-4xl font-bold">Release Kit</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your next release, step by step, plus the pitch template that gets songs heard.
          </p>
        </div>

        {items === null ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <ChecklistSection items={items} onToggle={toggle} />
        )}

        <PitchTemplateSection />
        <PitchExampleSection />
      </div>
    </div>
  );
}