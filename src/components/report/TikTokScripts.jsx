import { useState } from "react";
import { Video, Copy, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReportCard, { CardHeader } from "./ReportCard";
import { Button } from "@/components/ui/button";

function ScriptAccordionItem({ script, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = `HOOK: ${script.hook}\n\nBODY: ${script.body}\n\nCTA: ${script.cta}`;

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors text-left gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-muted-foreground font-mono shrink-0 w-5">{index + 1}.</span>
          <span className="font-heading font-semibold text-sm truncate">{script.format_name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {open && (
            <button
              onClick={copy}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <><Check className="h-3 w-3 text-primary" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
            </button>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 bg-secondary/10 space-y-3 border-t border-border">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Hook (0–3s)</p>
            <p className="text-sm text-foreground leading-relaxed">{script.hook}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-chart-5 uppercase tracking-widest">Body (3–20s)</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{script.body}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">CTA (final seconds)</p>
            <p className="text-sm text-foreground leading-relaxed">{script.cta}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TikTokScripts({ song = {}, tiktokScripts }) {
  const [scripts, setScripts] = useState(tiktokScripts || null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const audioData = song.audioData || {};
    const prompt = `Generate 10 TikTok launch script ideas for this specific song. Each one must be completely different in format and creative angle — no two should feel similar. Use the actual song data, lyrics, and mood to make each idea specific to this track. Generic ideas that could apply to any song are not acceptable.

SONG DATA:
- Title: ${song.title}
- Artist: ${song.artist}
- Genre: ${song.genre || "unknown"}
- BPM: ${audioData.bpm || "unknown"}
- Key: ${audioData.key || "unknown"}
- Energy (0-1): ${audioData.energy || "unknown"}
- Danceability (0-1): ${audioData.danceability || "unknown"}
- Valence / mood brightness (0-1): ${audioData.valence || "unknown"}
- Energy Profile: ${audioData.energyProfile || "unknown"}
- Mood Tag: ${audioData.moodTag || "unknown"}
- Description / notes: ${song.description || "none"}

For each script include:
1. format_name: A creative label that describes the unique angle (e.g. "The Vulnerable Confession", "The Unexpected Transition", "The Producer Breakdown") — draw this from what the song is actually about and how it sounds, not from a generic template
2. hook: The first 3 seconds — the exact line or action that stops the scroll
3. body: What happens in the middle 10–20 seconds — be specific about camera angles, text overlays, actions
4. cta: How it ends — the final moment that drives saves/follows/streams

Return exactly 10 scripts. Make them radically different from each other.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          scripts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                format_name: { type: "string" },
                hook: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
              },
            },
          },
        },
      },
    });
    setScripts(result.scripts || []);
    setLoading(false);
  };

  return (
    <ReportCard borderColor="border-l-red-500">
      <CardHeader icon={Video} title="TikTok Launch Scripts" iconColor="text-red-400" badge="10 Ideas" />
      <p className="text-sm text-muted-foreground -mt-2">10 AI-generated scripts tailored to the actual sound, mood, and energy of this track. Each one is a different creative angle.</p>

      {!scripts && !loading && (
        <Button onClick={generate} className="w-full gap-2" variant="outline">
          <Video className="h-4 w-4" />
          Generate 10 TikTok Scripts
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Claude is writing 10 unique scripts for this track…
        </div>
      )}

      {scripts && scripts.length > 0 && (
        <div className="space-y-2">
          {scripts.map((s, i) => (
            <ScriptAccordionItem key={i} script={s} index={i} />
          ))}
          <button
            onClick={generate}
            className="text-xs text-muted-foreground hover:text-primary transition-colors pt-1"
          >
            Regenerate scripts
          </button>
        </div>
      )}
    </ReportCard>
  );
}