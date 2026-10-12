import { useState } from "react";
import { Download, FileCode2, FileImage, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SoundReadyLogo from "@/components/SoundReadyLogo";

// 560x120 design canvas, exported at 4x (2240x480)
const SCALE = 4;
const W = 560;
const H = 120;

const SVG_FILE = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="120" viewBox="0 0 560 120"><g transform="translate(4,4) scale(1.12)"><rect x="26" y="24" width="52" height="52" rx="14" fill="none" stroke="white" stroke-width="6"/><path d="M26 41 A10 10 0 0 0 26 61 Z" fill="#00e676"/><path d="M78 41 A10 10 0 0 1 78 61 Z" fill="#00e676"/><path d="M40 49 a5 5 0 0 1 10 0 M60 49 a5 5 0 0 1 10 0" stroke="#00e676" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M44 62 a9 6.5 0 0 0 22 0" stroke="#00e676" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M74 26 C 86 23, 94 17, 100 8 M100 8 L88 9 M100 8 L96 19" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g><text x="137" y="84" font-family="'Space Grotesk', Arial, sans-serif" font-weight="900" font-size="70" letter-spacing="-1.75"><tspan fill="#ffffff">sound</tspan><tspan fill="#00e676">ready</tspan></text></svg>`;



// Draws the exact top-bar logo (mark + wordmark) onto a canvas.
async function renderLogo(darkBackground) {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");

  try {
    await document.fonts.load(`700 ${70 * SCALE}px "Space Grotesk"`);
  } catch {
    // fall back to system font below
  }

  if (darkBackground) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Robot-head mark: same geometry as the top-bar logo
  ctx.save();
  ctx.translate(4 * SCALE, 4 * SCALE);
  ctx.scale(1.12 * SCALE, 1.12 * SCALE);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Head outline
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(26, 24, 52, 52, 14);
  ctx.stroke();
  // Ears
  ctx.fillStyle = "#00e676";
  ctx.beginPath();
  ctx.arc(26, 51, 10, Math.PI / 2, Math.PI * 1.5, false);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(78, 51, 10, Math.PI * 1.5, Math.PI / 2, false);
  ctx.closePath();
  ctx.fill();
  // Arched eyes and smile
  ctx.strokeStyle = "#00e676";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(45, 49, 5, Math.PI, Math.PI * 2, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(65, 49, 5, Math.PI, Math.PI * 2, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(55, 62, 9, 6.5, 0, 0, Math.PI, false);
  ctx.stroke();
  // Growth arrow from the top right
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(74, 26);
  ctx.bezierCurveTo(86, 23, 94, 17, 100, 8);
  ctx.moveTo(100, 8); ctx.lineTo(88, 9);
  ctx.moveTo(100, 8); ctx.lineTo(96, 19);
  ctx.stroke();
  ctx.restore();

  // Wordmark: dark-theme colors, exactly as in the top bar
  ctx.font = `900 ${70 * SCALE}px "Space Grotesk", Arial, sans-serif`;
  try { ctx.letterSpacing = `${-1.75 * SCALE}px`; } catch {
    // older browsers: default spacing
  }
  const x = 137 * SCALE;
  const y = 84 * SCALE;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("sound", x, y);
  ctx.fillStyle = "#00e676";
  ctx.fillText("ready", x + ctx.measureText("sound").width, y);

  return canvas;
}

const saveFile = (href, name) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/**
 * Brand asset download page: the top-bar logo as JPG, PNG and SVG,
 * rendered in the browser from the exact same geometry and colors.
 */
export default function LogoDownload() {
  const [busy, setBusy] = useState(null);

  const downloadJpg = async () => {
    setBusy("jpg");
    const canvas = await renderLogo(true); // JPG has no transparency, so it sits on the site's dark background
    saveFile(canvas.toDataURL("image/jpeg", 0.95), "soundready-logo.jpg");
    setBusy(null);
  };

  const downloadPng = async () => {
    setBusy("png");
    const canvas = await renderLogo(false); // transparent background
    saveFile(canvas.toDataURL("image/png"), "soundready-logo.png");
    setBusy(null);
  };

  const downloadSvg = () => {
    const blob = new Blob([SVG_FILE], { type: "image/svg+xml" });
    saveFile(URL.createObjectURL(blob), "soundready-logo.svg");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <SEO title="SoundReady logo — download" description="Download the SoundReady logo as JPG, PNG or SVG." />
      <div className="w-full max-w-xl space-y-6 text-center">
        <h1 className="font-heading text-3xl font-bold">The SoundReady logo</h1>
        <p className="text-sm text-muted-foreground">
          Exactly as it appears in the top bar. Pick a format and it downloads instantly.
        </p>

        <div className="rounded-2xl bg-[#0a0a0a] border border-border p-8 flex items-center justify-center">
          <SoundReadyLogo size={44} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button className="gap-2 font-semibold" disabled={!!busy} onClick={downloadJpg}>
            <ImageIcon className="h-4 w-4" /> {busy === "jpg" ? "Rendering..." : "Download JPG"}
          </Button>
          <Button variant="outline" className="gap-2 font-semibold" disabled={!!busy} onClick={downloadPng}>
            <FileImage className="h-4 w-4" /> {busy === "png" ? "Rendering..." : "Download PNG"}
          </Button>
          <Button variant="outline" className="gap-2 font-semibold" disabled={!!busy} onClick={downloadSvg}>
            <FileCode2 className="h-4 w-4" /> Download SVG
          </Button>
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Download className="h-3 w-3" /> JPG comes on the site's dark background; PNG has a transparent one.
        </p>
      </div>
    </div>
  );
}