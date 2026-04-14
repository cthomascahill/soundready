import { useState } from "react";
import { Users, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReportSection from "../ReportSection";
import { Button } from "@/components/ui/button";

function CollabCard({ artist }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {artist.name.charAt(0)}
          </div>
          <div>
            <p className="font-heading font-semibold text-sm">{artist.name}</p>
            <p className="text-xs text-muted-foreground">{artist.genre}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium shrink-0">
          {artist.match}% match
        </span>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed">{artist.reason}</p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {(artist.strengths || []).map((s) => (
          <span key={s} className="px-2 py-0.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CollabSuggestions({ song = {}, similarArtists = [] }) {
  const [collabs, setCollabs] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music industry A&R consultant. Based on the track "${song.title}" by ${song.artist} — a ${song.genre} song with ${song.mood} mood and ${song.energy} energy — and considering artists with a similar sonic profile like: ${similarArtists.join(", ")}, suggest 4 potential feature collaboration artists.

For each collaborator, reason as if you've analyzed both artists' catalogues and sonic compatibility.

Return JSON with this schema: { "collaborators": [ { "name": string, "genre": string, "match": number (60-99), "reason": string (2 sentences on why they'd work together), "strengths": string[] (3 short tags like "Melodic hooks", "Dark energy") } ] }`,
      response_json_schema: {
        type: "object",
        properties: {
          collaborators: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                genre: { type: "string" },
                match: { type: "number" },
                reason: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    });
    setCollabs(result?.collaborators || []);
    setLoading(false);
  };

  return (
    <ReportSection number={8} title="Feature Collab Suggestions" icon={Users} color="text-chart-5">
      {!collabs && !loading && (
        <div className="text-center py-6 space-y-3">
          <p className="text-sm text-muted-foreground">Discover artists whose sound would complement yours perfectly.</p>
          <Button onClick={generate} className="gap-2" size="sm">
            <Sparkles className="h-3.5 w-3.5" />
            Find Collab Matches
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Analyzing artist compatibility...</p>
        </div>
      )}

      {collabs && (
        <div className="space-y-3">
          {collabs.map((a, i) => <CollabCard key={i} artist={a} />)}
          <button onClick={generate} className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Regenerate suggestions
          </button>
        </div>
      )}
    </ReportSection>
  );
}