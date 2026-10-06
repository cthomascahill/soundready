import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Sparkles, ListChecks, CalendarClock, Loader2 } from "lucide-react";

const STAGE_ORDER = ["Idea", "Demo", "Recorded", "Mixed", "Mastered", "Released"];

/**
 * AI-generated, stage-aware release plan for a Vault song —
 * tells the artist exactly what to do next based on where the song is.
 */
export default function ReleasePlanDialog({ song, onClose }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      setLoading(true);
      setError(null);
      try {
        const details = [
          `Title: ${song.title || "Untitled song"}`,
          song.featured_artists && `Featured artists: ${song.featured_artists}`,
          song.producer && `Producer: ${song.producer}`,
          song.genre && `Genre: ${song.genre}`,
          song.bpm && `BPM: ${song.bpm}`,
          song.key && `Key: ${song.key}`,
          song.moods?.length ? `Moods: ${song.moods.join(", ")}` : null,
          song.tags?.length ? `Tags: ${song.tags.join(", ")}` : null,
          song.release_date && `Target release date: ${song.release_date}`,
          song.notes && `Notes: ${song.notes}`,
        ].filter(Boolean).join("\n");

        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an experienced music release manager for independent artists. An artist just uploaded a song to their vault and wants a release plan.

Song details:
${details}

The song is currently at the "${song.status}" stage (lifecycle in order: ${STAGE_ORDER.join(" → ")}).

Write a personalized release plan telling them EXACTLY what to do next, starting from their current stage and ending with the song out on streaming platforms and promoted. Be concrete and specific to this song's genre, moods and situation — not generic advice. Each step should be an action they can actually take.

If the song is already "Released", focus the plan on post-release promotion and growing the song instead.`,
          response_json_schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "2-3 sentence overview of where the song is and the path to release",
              },
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Short action title" },
                    detail: { type: "string", description: "Exactly what to do, concretely, 1-3 sentences" },
                    timeframe: { type: "string", description: "When to do it, e.g. 'This week', '2 weeks before release'" },
                  },
                  required: ["title", "detail", "timeframe"],
                },
              },
            },
            required: ["summary", "steps"],
          },
        });
        if (!cancelled) setPlan(res);
      } catch (e) {
        if (!cancelled) setError(e.message || "Something went wrong generating your plan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    generate();
    return () => { cancelled = true; };
  }, [song?.id, song?.title, song?.status]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-lg truncate">Release Plan</h2>
              <p className="text-xs text-muted-foreground truncate">
                {song.title || "Untitled song"} — currently at {song.status || "Idea"} stage
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Building your release plan for {song.status} stage...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-medium text-foreground">Couldn't generate your plan</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          ) : plan ? (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.summary}</p>

              <div className="space-y-3">
                {plan.steps?.map((step, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-border bg-background/50 p-4">
                    <div className="h-7 w-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ListChecks className="h-3.5 w-3.5 text-primary shrink-0" />
                        <p className="text-sm font-semibold">{step.title}</p>
                        {step.timeframe && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-primary/25 bg-primary/10 text-primary flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />{step.timeframe}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}