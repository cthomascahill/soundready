import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Wand2, Sparkles, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssetCard from "../components/AssetCard";

// ── Canvas drawing helpers ──────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function scoreBar(ctx, x, y, w, h, score, color) {
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, x, y, (w * score) / 100, h, h / 2);
  ctx.fill();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return y;
}

async function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Spotify / Streaming Card (1000×1000) ────────────────────────────────────
function drawSpotifyCard(canvas, analysis, coverImg, palette) {
  const W = 1000, H = 1000;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // BG gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, palette.dark);
  bg.addColorStop(1, palette.mid);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Cover art
  if (coverImg) {
    ctx.save();
    roundRect(ctx, 60, 60, 880, 580, 24);
    ctx.clip();
    ctx.drawImage(coverImg, 60, 60, 880, 580);
    ctx.restore();
    // overlay
    const ov = ctx.createLinearGradient(0, 400, 0, 640);
    ov.addColorStop(0, "rgba(0,0,0,0)");
    ov.addColorStop(1, palette.dark + "ee");
    ctx.fillStyle = ov;
    ctx.fillRect(60, 60, 880, 580);
  }

  // Score badge
  ctx.fillStyle = palette.accent;
  roundRect(ctx, 60, 660, 160, 70, 12);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 36px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${analysis.overall_score}`, 140, 706);
  ctx.font = "13px 'Inter', sans-serif";
  ctx.fillText("SCORE", 140, 724);

  // Title & artist
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px 'Space Grotesk', sans-serif";
  ctx.fillText(analysis.title, 60, 800);
  ctx.font = "28px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(analysis.artist_name, 60, 842);

  // Platform bars
  const platforms = [
    { label: "Spotify", score: analysis.spotify_score || 0 },
    { label: "Apple Music", score: analysis.apple_music_score || 0 },
    { label: "TikTok", score: analysis.tiktok_score || 0 },
  ];
  let bx = 60, by = 880;
  platforms.forEach(({ label, score }) => {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "20px 'Inter', sans-serif";
    ctx.fillText(label, bx, by);
    scoreBar(ctx, bx, by + 8, 240, 10, score, palette.accent);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 18px 'Space Grotesk', sans-serif";
    ctx.fillText(`${score}`, bx + 248, by + 18);
    bx += 310;
  });

  // Watermark
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "22px 'Space Grotesk', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("SoundScore", W - 40, H - 40);
}

// ── Instagram Story (1080×1920) ──────────────────────────────────────────────
function drawInstagramStory(canvas, analysis, coverImg, palette) {
  const W = 1080, H = 1920;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, palette.dark);
  bg.addColorStop(0.6, palette.mid);
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Cover
  if (coverImg) {
    ctx.save();
    roundRect(ctx, 80, 260, 920, 920, 40);
    ctx.clip();
    ctx.drawImage(coverImg, 80, 260, 920, 920);
    ctx.restore();
  }

  // Top label
  ctx.fillStyle = palette.accent;
  roundRect(ctx, 80, 160, 340, 60, 30);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 26px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NEW TRACK", 250, 198);

  // Bottom card
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(ctx, 60, 1230, 960, 500, 32);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 72px 'Space Grotesk', sans-serif";
  ctx.fillText(analysis.title.toUpperCase(), 100, 1330);
  ctx.font = "36px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(analysis.artist_name, 100, 1385);

  // Genre & mood chips
  [analysis.genre, analysis.mood, analysis.energy_level + " energy"].filter(Boolean).forEach((tag, i) => {
    const tx = 100 + i * 230;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    roundRect(ctx, tx, 1420, 210, 50, 25);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "22px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(tag, tx + 105, 1452);
    ctx.textAlign = "left";
  });

  // Big score
  ctx.fillStyle = palette.accent;
  ctx.font = "bold 160px 'Space Grotesk', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${analysis.overall_score}`, 940, 1640);
  ctx.font = "30px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("ALGORITHM SCORE", 600, 1660);

  // CTA
  ctx.fillStyle = palette.accent;
  roundRect(ctx, 100, 1690, 880, 90, 45);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 36px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STREAM NOW 🎵", 540, 1745);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "24px 'Space Grotesk', sans-serif";
  ctx.fillText("SoundScore", 540, 1870);
}

// ── Twitter / X Banner (1500×500) ────────────────────────────────────────────
function drawTwitterCard(canvas, analysis, coverImg, palette) {
  const W = 1500, H = 500;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, palette.dark);
  bg.addColorStop(1, palette.mid);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  if (coverImg) {
    ctx.save();
    roundRect(ctx, W - 520, 40, 460, 420, 20);
    ctx.clip();
    ctx.drawImage(coverImg, W - 520, 40, 460, 420);
    ctx.restore();
  }

  ctx.textAlign = "left";
  ctx.fillStyle = palette.accent;
  ctx.font = "bold 22px 'Space Grotesk', sans-serif";
  ctx.fillText("🎵 NEW RELEASE", 60, 80);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 72px 'Space Grotesk', sans-serif";
  ctx.fillText(analysis.title, 60, 175);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "34px 'Inter', sans-serif";
  ctx.fillText(analysis.artist_name, 60, 225);

  if (analysis.genre) {
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    roundRect(ctx, 60, 255, 180, 46, 23);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "22px 'Inter', sans-serif";
    ctx.fillText(analysis.genre, 105, 284);
  }

  // Score
  ctx.fillStyle = palette.accent;
  ctx.font = "bold 100px 'Space Grotesk', sans-serif";
  ctx.fillText(`${analysis.overall_score}`, 60, 420);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "22px 'Inter', sans-serif";
  ctx.fillText("/ 100  ALGORITHM SCORE", 200, 415);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "22px 'Space Grotesk', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("SoundScore", W - 40, H - 30);
}

// ── TikTok / Reels (1080×1920) — different layout ───────────────────────────
function drawTikTokCard(canvas, analysis, coverImg, palette) {
  const W = 1080, H = 1920;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  if (coverImg) {
    ctx.save();
    // Full bleed blurred bg effect via scaling
    ctx.globalAlpha = 0.35;
    ctx.drawImage(coverImg, -100, 0, W + 200, H);
    ctx.globalAlpha = 1;
    ctx.restore();
    // Center cover
    ctx.save();
    roundRect(ctx, 140, 300, 800, 800, 400);
    ctx.clip();
    ctx.drawImage(coverImg, 140, 300, 800, 800);
    ctx.restore();
  }

  // Gradient overlay bottom
  const grad = ctx.createLinearGradient(0, 900, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.4, "rgba(0,0,0,0.85)");
  grad.addColorStop(1, "#000");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 900, W, H - 900);

  // Platform badge
  ctx.fillStyle = palette.accent;
  roundRect(ctx, W / 2 - 130, 180, 260, 64, 32);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🎵 TRENDING SOUND", W / 2, 220);

  // Title bottom
  ctx.fillStyle = "#fff";
  ctx.font = "bold 86px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  wrapText(ctx, analysis.title, W / 2, 1200, 900, 96);

  ctx.font = "40px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(analysis.artist_name, W / 2, 1390);

  // Score ring visual
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 16;
  ctx.beginPath();
  const angle = ((analysis.overall_score || 0) / 100) * Math.PI * 2 - Math.PI / 2;
  ctx.arc(W / 2, 1560, 130, -Math.PI / 2, angle);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.arc(W / 2, 1560, 130, angle, (3 * Math.PI) / 2);
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 90px 'Space Grotesk', sans-serif";
  ctx.fillText(`${analysis.overall_score}`, W / 2, 1590);
  ctx.font = "28px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("SCORE", W / 2, 1640);

  // Tags
  const tags = [analysis.mood, analysis.genre, "#NewMusic"].filter(Boolean);
  ctx.font = "30px 'Inter', sans-serif";
  ctx.fillStyle = palette.accent;
  ctx.fillText(tags.map((t) => `#${t.replace(/\s+/g, "")}`).join("  "), W / 2, 1760);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "26px 'Space Grotesk', sans-serif";
  ctx.fillText("SoundScore", W / 2, 1880);
}

// ── Color palettes ───────────────────────────────────────────────────────────
const PALETTES = {
  purple: { dark: "#0d0a1a", mid: "#1a1030", accent: "#8b5cf6" },
  teal:   { dark: "#0a1a18", mid: "#0f2a26", accent: "#14b8a6" },
  amber:  { dark: "#1a1000", mid: "#2a1a00", accent: "#f59e0b" },
  rose:   { dark: "#1a0a10", mid: "#2a0f18", accent: "#f43f5e" },
  blue:   { dark: "#080d1a", mid: "#0f1a30", accent: "#3b82f6" },
};

const PALETTE_LABELS = {
  purple: "Violet", teal: "Teal", amber: "Amber", rose: "Rose", blue: "Ocean"
};

export default function MarketingAssets() {
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [palette, setPalette] = useState("purple");
  const [generating, setGenerating] = useState(false);
  const [rendered, setRendered] = useState(false);

  const spotifyRef = useRef(null);
  const storyRef = useRef(null);
  const twitterRef = useRef(null);
  const tiktokRef = useRef(null);

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50).then((items) => {
      setAnalyses(items);
      if (items.length > 0) setSelectedId(items[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const found = analyses.find((a) => a.id === selectedId);
    setAnalysis(found || null);
    setCoverUrl(null);
    setCoverImg(null);
    setRendered(false);
  }, [selectedId, analyses]);

  const generateCoverArt = async () => {
    if (!analysis) return;
    setGenerating(true);
    const result = await base44.integrations.Core.GenerateImage({
      prompt: `Album cover art for a ${analysis.genre || "music"} song titled "${analysis.title}" by ${analysis.artist_name}. Mood: ${analysis.mood || "energetic"}. Energy: ${analysis.energy_level || "high"}. Style: cinematic, dark, professional, moody lighting, high-contrast, music industry quality. No text, no letters.`,
    });
    setCoverUrl(result.url);
    const img = await loadImage(result.url);
    setCoverImg(img);
    setGenerating(false);
  };

  const renderAssets = useCallback(() => {
    if (!analysis) return;
    const pal = PALETTES[palette];
    drawSpotifyCard(spotifyRef.current, analysis, coverImg, pal);
    drawInstagramStory(storyRef.current, analysis, coverImg, pal);
    drawTwitterCard(twitterRef.current, analysis, coverImg, pal);
    drawTikTokCard(tiktokRef.current, analysis, coverImg, pal);
    setRendered(true);
  }, [analysis, coverImg, palette]);

  useEffect(() => {
    if (rendered) renderAssets();
  }, [palette]);

  if (analyses.length === 0 && !analysis) {
    return (
      <div className="text-center py-32">
        <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-semibold mb-2">No analyzed tracks yet</h2>
        <p className="text-muted-foreground mb-6">Analyze a track first to generate marketing assets.</p>
        <Link to="/upload"><Button>Upload a Track</Button></Link>
      </div>
    );
  }

  const assets = [
    { label: "Streaming Card", dimensions: "1000 × 1000 · Square", ref: spotifyRef },
    { label: "Instagram Story", dimensions: "1080 × 1920 · Portrait", ref: storyRef },
    { label: "Twitter / X Banner", dimensions: "1500 × 500 · Landscape", ref: twitterRef },
    { label: "TikTok / Reels", dimensions: "1080 × 1920 · Portrait", ref: tiktokRef },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Marketing Studio</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">Asset Generator</h1>
          <p className="text-muted-foreground mt-1">AI-generated promotional graphics for every platform</p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-card border border-border p-6 space-y-6">

        {/* Song selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Track</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-11 rounded-lg bg-secondary border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {analyses.map((a) => (
              <option key={a.id} value={a.id}>{a.title} — {a.artist_name}</option>
            ))}
          </select>
        </div>

        {/* Color palette */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Color Theme</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PALETTES).map(([key, pal]) => (
              <button
                key={key}
                onClick={() => setPalette(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  palette === key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
                }`}
              >
                <div className="h-3 w-3 rounded-full" style={{ background: pal.accent }} />
                {PALETTE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Cover art & generate */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={generateCoverArt}
            disabled={generating || !analysis}
            variant="outline"
            className="gap-2"
          >
            {generating ? (
              <><span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />Generating Cover Art...</>
            ) : (
              <><Sparkles className="h-4 w-4" />{coverUrl ? "Regenerate Cover Art" : "Generate AI Cover Art"}</>
            )}
          </Button>

          <Button
            onClick={renderAssets}
            disabled={!analysis}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {rendered ? "Re-render Assets" : "Generate All Assets"}
          </Button>
        </div>

        {coverUrl && (
          <div className="flex items-center gap-4">
            <img src={coverUrl} alt="Cover art" className="h-20 w-20 rounded-xl object-cover border border-border" />
            <p className="text-sm text-muted-foreground">AI-generated cover art ready. Click "Generate All Assets" to apply.</p>
          </div>
        )}
      </motion.div>

      {/* Asset grid */}
      {rendered && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {assets.map(({ label, dimensions, ref }, i) => (
            <AssetCard key={label} label={label} dimensions={dimensions} canvasRef={ref} loading={false} index={i} />
          ))}
        </div>
      )}

      {/* Hidden canvases (always mounted so refs are valid) */}
      <div className="hidden">
        <canvas ref={spotifyRef} />
        <canvas ref={storyRef} />
        <canvas ref={twitterRef} />
        <canvas ref={tiktokRef} />
      </div>
    </div>
  );
}