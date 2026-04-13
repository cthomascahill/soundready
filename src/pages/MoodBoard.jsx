import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, Music, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function HexSwatch({ color, name }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="group flex flex-col items-center gap-2">
      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-white/10 shadow-lg transition-transform group-hover:scale-105"
        style={{ background: color }} />
      <div className="text-center">
        <p className="font-mono text-xs font-bold">{color}</p>
        <p className="text-[10px] text-muted-foreground">{name}</p>
      </div>
      {copied && <span className="text-[10px] text-accent">Copied!</span>}
    </button>
  );
}

function FontPreview({ font }) {
  return (
    <div className="rounded-xl bg-secondary/50 border border-border p-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">{font.use_case}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{font.weight}</span>
      </div>
      <p className="text-2xl font-bold mt-1" style={{ fontFamily: font.name, fontWeight: font.weight_value }}>
        {font.name}
      </p>
      <p className="text-sm text-muted-foreground">{font.description}</p>
      <p className="text-xs text-muted-foreground/60 italic">Available on Google Fonts</p>
    </div>
  );
}

function AestheticSection({ label, items, color }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-3 py-1.5 rounded-full text-sm border"
            style={{ borderColor: color + "40", background: color + "10", color }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MoodBoard() {
  const [songs, setSongs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get("id");

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50).then((s) => {
      setSongs(s);
      setSelectedId(paramId || s[0]?.id || "");
      setLoading(false);
    });
  }, []);

  const selectedSong = songs.find((s) => s.id === selectedId);

  const generate = async () => {
    if (!selectedSong) return;
    setGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a world-class creative director and brand identity expert for music artists. 
Based on this song's sonic analysis, generate a complete visual brand identity / mood board.

Song: "${selectedSong.title}" by ${selectedSong.artist_name}
Genre: ${selectedSong.genre}
Mood: ${selectedSong.mood}
Energy: ${selectedSong.energy_level}
BPM: ~${selectedSong.bpm_estimate}
Similar Artists: ${(selectedSong.similar_artists || []).slice(0, 4).join(", ")}
Strengths: ${(selectedSong.strengths || []).slice(0, 3).join(", ")}

Create a cohesive visual identity that perfectly captures this song's sonic personality. Be SPECIFIC — not generic. Every color, font, and aesthetic choice should directly reflect something about this song.`,
      response_json_schema: {
        type: "object",
        properties: {
          brand_direction: {
            type: "object",
            properties: {
              tagline: { type: "string", description: "A 5-7 word visual identity tagline for this track" },
              aesthetic_summary: { type: "string", description: "2 sentences describing the overall visual vibe" }
            }
          },
          color_palette: {
            type: "array",
            description: "6 hex colors that form a cohesive palette",
            items: {
              type: "object",
              properties: {
                hex: { type: "string", description: "Hex code like #1A0A2E" },
                name: { type: "string", description: "Poetic name like 'Midnight Violet'" },
                use: { type: "string", description: "e.g. Primary Background, Accent, Text" }
              }
            }
          },
          typography: {
            type: "array",
            description: "3 font recommendations (all must be on Google Fonts)",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Google Fonts font name" },
                use_case: { type: "string", description: "e.g. Headlines, Body Copy, Captions" },
                weight: { type: "string", description: "e.g. Bold 700, Light 300" },
                weight_value: { type: "string", description: "CSS font-weight value" },
                description: { type: "string", description: "Why this font fits the song's personality" }
              }
            }
          },
          photography_style: {
            type: "object",
            properties: {
              lighting: { type: "array", items: { type: "string" }, description: "3-4 specific lighting descriptors" },
              composition: { type: "array", items: { type: "string" }, description: "3-4 composition/framing styles" },
              locations: { type: "array", items: { type: "string" }, description: "4-5 specific location types" },
              editing_style: { type: "array", items: { type: "string" }, description: "4-5 photo editing style descriptors" },
              wardrobe: { type: "array", items: { type: "string" }, description: "4-5 wardrobe/styling directions" }
            }
          },
          content_mood: {
            type: "object",
            properties: {
              dos: { type: "array", items: { type: "string" }, description: "5 specific visual DO's for this brand" },
              donts: { type: "array", items: { type: "string" }, description: "4 specific visual DONT's" },
              reference_aesthetics: { type: "array", items: { type: "string" }, description: "4-5 aesthetic movements or cultural references (e.g. Y2K, brutalist, cottagecore)" }
            }
          }
        }
      }
    });
    setResult(res);
    setGenerating(false);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (songs.length === 0) return (
    <div className="text-center py-32">
      <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="font-heading text-2xl font-semibold mb-2">No analyzed tracks yet</h2>
      <Link to="/upload"><Button>Upload a Track</Button></Link>
    </div>
  );

  const accentColor = result?.color_palette?.[1]?.hex || "hsl(var(--primary))";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Brand Identity</p>
        <h1 className="font-heading text-3xl font-bold">Mood Board Generator</h1>
        <p className="text-muted-foreground mt-1">AI-powered visual identity built from your song's sonic DNA.</p>
      </motion.div>

      {/* Selector */}
      <motion.div className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row gap-4 items-end"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Select Track</label>
          <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
            className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
          </select>
        </div>
        <Button onClick={generate} disabled={generating || !selectedSong} className="gap-2 shrink-0">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {result ? "Regenerate" : "Generate Mood Board"}
        </Button>
      </motion.div>

      {generating && (
        <div className="flex items-center justify-center gap-3 py-14 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Analyzing sonic DNA and building your visual identity...</span>
        </div>
      )}

      <AnimatePresence>
        {result && !generating && (
          <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Brand Direction Hero */}
            <div className="rounded-2xl border p-8 text-center space-y-3"
              style={{ background: `linear-gradient(135deg, ${result.color_palette?.[0]?.hex}33, ${result.color_palette?.[2]?.hex}22)`, borderColor: accentColor + "40" }}>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Visual Identity</p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold" style={{ color: accentColor }}>
                "{result.brand_direction?.tagline}"
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                {result.brand_direction?.aesthetic_summary}
              </p>
            </div>

            {/* Color Palette */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-xl">Color Palette</h2>
              <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                {result.color_palette?.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <HexSwatch color={c.hex} name={c.name} />
                    <span className="text-[10px] text-muted-foreground/70 text-center max-w-[80px]">{c.use}</span>
                  </div>
                ))}
              </div>
              {/* Full palette preview bar */}
              <div className="h-10 rounded-xl overflow-hidden flex mt-2">
                {result.color_palette?.map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c.hex }} />
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="font-heading font-semibold text-xl">Typography</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.typography?.map((font, i) => <FontPreview key={i} font={font} />)}
              </div>
            </div>

            {/* Photography Style */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-xl">Photography Direction</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AestheticSection label="Lighting" items={result.photography_style?.lighting || []} color={accentColor} />
                <AestheticSection label="Composition" items={result.photography_style?.composition || []} color={accentColor} />
                <AestheticSection label="Locations" items={result.photography_style?.locations || []} color={accentColor} />
                <AestheticSection label="Editing Style" items={result.photography_style?.editing_style || []} color={accentColor} />
                <AestheticSection label="Wardrobe / Styling" items={result.photography_style?.wardrobe || []} color={accentColor} />
              </div>
            </div>

            {/* Content Dos & Donts */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <h2 className="font-heading font-semibold text-xl">Brand Rules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs text-accent uppercase tracking-widest font-medium">✓ Do These</p>
                  <ul className="space-y-2">
                    {result.content_mood?.dos?.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-accent mt-0.5">✦</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-destructive uppercase tracking-widest font-medium">✗ Avoid These</p>
                  <ul className="space-y-2">
                    {result.content_mood?.donts?.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-destructive mt-0.5">—</span>
                        <span className="text-muted-foreground">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {result.content_mood?.reference_aesthetics?.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <AestheticSection label="Reference Aesthetics" items={result.content_mood.reference_aesthetics} color={accentColor} />
                </div>
              )}
            </div>

            <div className="flex justify-center pb-4">
              <Button variant="ghost" size="sm" onClick={generate} className="gap-2 text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />Regenerate Mood Board
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}