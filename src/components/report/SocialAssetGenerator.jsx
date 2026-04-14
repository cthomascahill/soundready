import { useState } from "react";
import { Wand2, Download, RefreshCw, ImageIcon, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReportCard, { CardHeader } from "./ReportCard";

const MOOD_PALETTES = {
  Happy: { colors: ["#FFD166", "#F4A261", "#FFFFFF"], fonts: { heading: "Syne" }, aesthetic: ["vibrant", "warm", "joyful"] },
  Melancholic: { colors: ["#2D3047", "#8ECAE6", "#E0E0E0"], fonts: { heading: "Playfair Display" }, aesthetic: ["cinematic", "intimate", "melancholic"] },
  Hype: { colors: ["#FF006E", "#FB5607", "#FFBE0B"], fonts: { heading: "Bebas Neue" }, aesthetic: ["bold", "electric", "raw"] },
  Romantic: { colors: ["#FFAFCC", "#CDB4DB", "#FFC8DD"], fonts: { heading: "Cormorant Garamond" }, aesthetic: ["dreamy", "tender", "ethereal"] },
  Dark: { colors: ["#0D0D0D", "#E63946", "#FFFFFF"], fonts: { heading: "Anton" }, aesthetic: ["cinematic", "raw", "intense"] },
  Inspirational: { colors: ["#06D6A0", "#118AB2", "#FFFFFF"], fonts: { heading: "Montserrat" }, aesthetic: ["expansive", "hopeful", "powerful"] },
  Chill: { colors: ["#A8DADC", "#457B9D", "#F1FAEE"], fonts: { heading: "Raleway" }, aesthetic: ["minimal", "calm", "organic"] },
};

const DEFAULT_PALETTE = {
  colors: ["#1A1A2E", "#16213E", "#E94560"],
  fonts: { heading: "Space Grotesk" },
  aesthetic: ["cinematic", "bold", "atmospheric"],
};

const ASSET_TYPES = [
  {
    id: "promo_banner",
    label: "Promo Banner",
    ratio: "1:1",
    description: "Square post for feed",
    icon: "🖼️",
    promptSuffix: "Square 1:1 social media promo banner. Prominently display the song title as large bold text centered in the image. Artist name in smaller elegant text below. No other text. Strong visual hierarchy.",
  },
  {
    id: "story",
    label: "Story Backdrop",
    ratio: "9:16",
    description: "Vertical story format",
    icon: "📱",
    promptSuffix: "Tall vertical 9:16 Instagram or TikTok story backdrop. The song title text in large bold typography at the center-bottom third. Artist name smaller above it. Lots of visual breathing room at the top for video overlay.",
  },
  {
    id: "twitter_card",
    label: "Twitter Card",
    ratio: "2:1",
    description: "Wide card for Twitter/X",
    icon: "🐦",
    promptSuffix: "Wide 2:1 landscape Twitter/X announcement card. Song title in bold large type on the left side. Artist name underneath. Right side is a strong visual design element. Cinematic wide composition.",
  },
];

function buildPrompt(song, palette, assetType) {
  const colors = palette.colors.join(", ");
  const keywords = palette.aesthetic.join(", ");
  const font = palette.fonts.heading;

  return `Create a professional music release social media graphic for a ${song.genre || "music"} song.

Song title: "${song.title || "Song Title"}"
Artist name: "${song.artist || "Artist Name"}"
Mood: ${song.mood || "emotional"}
Genre: ${song.genre || "music"}
Energy: ${song.energy || "medium"}

Visual style requirements:
- Color palette: ${colors} — use these exact colors as the dominant palette
- Aesthetic keywords: ${keywords}
- Typography style: inspired by ${font} font — bold, clear, legible
- The song title text "${song.title}" must appear prominently and be clearly legible
- The artist name "${song.artist}" must appear in the design

Design direction:
- Professional music industry quality, suitable for streaming platform promotion
- ${palette.aesthetic[0]} and ${palette.aesthetic[1]} visual atmosphere
- Abstract or geometric background elements that evoke the ${song.mood || "emotional"} mood
- No photorealistic faces, no copyrighted logos, no text other than the song title and artist name
- Photoshop-quality compositing, dramatic lighting, premium feel

Format: ${assetType.promptSuffix}`;
}

function AssetCard({ type, song, palette, }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = buildPrompt(song, palette, type);
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      setImageUrl(result.url);
    } catch (e) {
      setError("Generation failed. Try again.");
    }
    setLoading(false);
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${(song.title || "promo").replace(/\s+/g, "-").toLowerCase()}-${type.id}.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">{type.icon}</span>
          <div>
            <p className="font-heading font-semibold text-sm">{type.label}</p>
            <p className="text-xs text-muted-foreground">{type.description} · {type.ratio}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {imageUrl && (
            <button onClick={download}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Download className="h-3 w-3" />
              Save
            </button>
          )}
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
            {loading
              ? <><Loader2 className="h-3 w-3 animate-spin" />Generating...</>
              : imageUrl
              ? <><RefreshCw className="h-3 w-3" />Regenerate</>
              : <><Wand2 className="h-3 w-3" />Generate</>}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="relative bg-secondary/10 flex items-center justify-center" style={{ minHeight: 220 }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 z-10">
            <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Creating your asset...</p>
          </div>
        )}
        {imageUrl && !loading ? (
          <img src={imageUrl} alt={`${type.label} for ${song.title}`}
            className="w-full h-full object-contain max-h-72" />
        ) : !loading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <div className="h-12 w-12 rounded-xl bg-secondary/50 border border-border flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/70">No image yet</p>
              <p className="text-xs text-muted-foreground mt-1">Hit Generate to create your {type.label}</p>
            </div>
            {/* Palette preview */}
            <div className="flex gap-1.5 mt-1">
              {palette.colors.map((hex) => (
                <div key={hex} className="h-5 w-5 rounded-full border border-border/50"
                  style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>
        ) : null}
        {error && (
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function SocialAssetGenerator({ song = {} }) {
  const palette = MOOD_PALETTES[song.mood] || DEFAULT_PALETTE;

  return (
    <ReportCard borderColor="border-l-purple-500">
      <CardHeader icon={Wand2} title="Social Asset Generator" iconColor="text-purple-400" badge="Section 12" />
      <p className="text-sm text-muted-foreground -mt-2">
        AI-generated promo assets using your Visual Identity palette — <span className="text-foreground font-medium">{palette.aesthetic.join(", ")}</span> with colors {palette.colors.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 mx-0.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-border/50 align-middle" style={{ backgroundColor: c }} />
            <span className="font-mono text-xs">{c}</span>
          </span>
        ))}.
      </p>

      <div className="space-y-4">
        {ASSET_TYPES.map((type) => (
          <AssetCard key={type.id} type={type} song={song} palette={palette} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Each asset is generated fresh using your song's mood, genre, and visual identity. Download and use directly in your release campaign.
      </p>
    </ReportCard>
  );
}