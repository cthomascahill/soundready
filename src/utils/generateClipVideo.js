/**
 * Generates a downloadable vertical MP4 (1080x1920) for a clip using Canvas + MediaRecorder.
 * Renders: animated cinematic background, particle effects, lyric overlay with chosen text style,
 * color grade, motion effects, and branding.
 */

const VIBE_PALETTES = {
  aggressive: {
    bg1: "#0a0000", bg2: "#1a0000", bg3: "#000000",
    accent: "#cc2200", accent2: "#ff4400",
    particle: "rgba(204,34,0,",
    textColor: "#ffffff",
    shadowColor: "#cc2200",
  },
  emotional: {
    bg1: "#000814", bg2: "#001533", bg3: "#000000",
    accent: "#1a4a8a", accent2: "#3a7fd4",
    particle: "rgba(58,127,212,",
    textColor: "#ffffff",
    shadowColor: "#3a7fd4",
  },
  confident: {
    bg1: "#0a0800", bg2: "#1a1200", bg3: "#000000",
    accent: "#b8860b", accent2: "#ffd700",
    particle: "rgba(255,215,0,",
    textColor: "#ffffff",
    shadowColor: "#ffd700",
  },
  storytelling: {
    bg1: "#001a14", bg2: "#00261a", bg3: "#000000",
    accent: "#00695c", accent2: "#26a69a",
    particle: "rgba(38,166,154,",
    textColor: "#ffffff",
    shadowColor: "#26a69a",
  },
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export async function generateClipVideo(clip, vibe, onProgress) {
  const W = 1080;
  const H = 1920;
  const FPS = 30;
  const DURATION = clip.duration || 10;
  const TOTAL_FRAMES = FPS * DURATION;

  const palette = VIBE_PALETTES[vibe] || VIBE_PALETTES.confident;
  const lyric = clip.lyric_overlay || "";
  const textStyle = clip.text_style || "bold_caption";
  const colorGrade = clip.color_grade || "";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Setup MediaRecorder
  const stream = canvas.captureStream(FPS);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  // Pre-build particles
  const PARTICLE_COUNT = 60;
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 1.5,
    vy: -Math.random() * 2 - 0.5,
    size: Math.random() * 4 + 1,
    opacity: Math.random() * 0.6 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }));

  // Split lyric into words for timed_lyric style
  const words = lyric.split(" ").filter(Boolean);

  function drawFrame(frameIdx) {
    const t = frameIdx / TOTAL_FRAMES; // 0..1
    const timeSec = frameIdx / FPS;

    // --- BACKGROUND ---
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, palette.bg1);
    bgGrad.addColorStop(0.5, palette.bg2);
    bgGrad.addColorStop(1, palette.bg3);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Radial glow in center-ish
    const glowX = W * 0.5 + Math.sin(t * Math.PI * 2) * 80;
    const glowY = H * 0.4 + Math.cos(t * Math.PI * 1.5) * 120;
    const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 600);
    glow.addColorStop(0, palette.accent + "22");
    glow.addColorStop(0.5, palette.accent + "08");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Secondary glow bottom
    const glow2 = ctx.createRadialGradient(W * 0.5, H * 0.8, 0, W * 0.5, H * 0.8, 400);
    glow2.addColorStop(0, palette.accent2 + "15");
    glow2.addColorStop(1, "transparent");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // --- PARTICLES ---
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      const pulse = 0.5 + 0.5 * Math.sin(timeSec * 3 + p.phase);
      const alpha = p.opacity * pulse;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = palette.particle + alpha + ")";
      ctx.fill();
    });

    // Horizontal scan lines (cinematic feel)
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, y, W, 1);
    }

    // --- VIGNETTE ---
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    vig.addColorStop(0, "transparent");
    vig.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // --- MOTION LINES (vibe-specific) ---
    if (vibe === "aggressive") {
      // Fast diagonal lines
      ctx.save();
      ctx.globalAlpha = 0.04 + 0.04 * Math.sin(timeSec * 8);
      for (let i = 0; i < 8; i++) {
        const x = ((i * 150 + timeSec * 300) % (W + 300)) - 150;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 100, H);
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    } else if (vibe === "emotional") {
      // Rain drops
      ctx.save();
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 40; i++) {
        const rx = (i * 27 + timeSec * 150) % W;
        const ry = (i * 53 + timeSec * 400) % H;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 18);
        ctx.strokeStyle = palette.accent2;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- COLOR GRADE OVERLAY ---
    if (colorGrade.toLowerCase().includes("warm") || colorGrade.toLowerCase().includes("amber")) {
      ctx.fillStyle = "rgba(255,140,0,0.04)";
      ctx.fillRect(0, 0, W, H);
    } else if (colorGrade.toLowerCase().includes("cold") || colorGrade.toLowerCase().includes("blue")) {
      ctx.fillStyle = "rgba(0,80,160,0.04)";
      ctx.fillRect(0, 0, W, H);
    } else if (colorGrade.toLowerCase().includes("teal") || colorGrade.toLowerCase().includes("green")) {
      ctx.fillStyle = "rgba(0,120,100,0.04)";
      ctx.fillRect(0, 0, W, H);
    }

    // Film grain
    ctx.save();
    ctx.globalAlpha = 0.025;
    for (let i = 0; i < 800; i++) {
      const gx = Math.random() * W;
      const gy = Math.random() * H;
      const gs = Math.random() * 2;
      ctx.fillStyle = Math.random() > 0.5 ? "white" : "black";
      ctx.fillRect(gx, gy, gs, gs);
    }
    ctx.restore();

    // --- LYRICS OVERLAY ---
    const textY = H * 0.72;
    ctx.save();

    if (textStyle === "bold_caption") {
      // Large bold centered caption with black backing bar
      const fontSize = 72;
      ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Fade in at 0.1, fade out at 0.85
      const fadeIn = Math.min(1, t / 0.1);
      const fadeOut = t > 0.85 ? Math.max(0, 1 - (t - 0.85) / 0.15) : 1;
      const alpha = fadeIn * fadeOut;

      // Wrap text
      const maxWidth = W - 120;
      const lines = wrapText(ctx, lyric.toUpperCase(), maxWidth);
      const lineH = fontSize * 1.2;
      const totalH = lines.length * lineH + 40;
      const blockTop = textY - totalH / 2;

      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      ctx.fillRect(0, blockTop - 10, W, totalH + 20);

      ctx.globalAlpha = alpha;
      lines.forEach((line, li) => {
        const ly = blockTop + li * lineH + lineH / 2;
        ctx.shadowColor = palette.shadowColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, W / 2, ly);
        ctx.shadowBlur = 0;
      });

    } else if (textStyle === "timed_lyric") {
      // Word-by-word reveal
      const wordsPerSecond = words.length / (DURATION * 0.7);
      const wordIdx = Math.min(Math.floor(timeSec * wordsPerSecond), words.length - 1);
      const visibleWords = words.slice(0, wordIdx + 1);

      ctx.font = `bold 68px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxWidth = W - 160;
      const lines = wrapText(ctx, visibleWords.join(" "), maxWidth);
      const lineH = 82;
      const startY = textY - ((lines.length - 1) * lineH) / 2;

      lines.forEach((line, li) => {
        const ly = startY + li * lineH;
        // Shadow
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, W / 2, ly);

        // Current word highlight (last word in last line)
        if (li === lines.length - 1) {
          ctx.shadowColor = palette.shadowColor;
          ctx.shadowBlur = 30;
          ctx.fillStyle = palette.accent2;
          const lineWords = line.split(" ");
          const lastWord = lineWords[lineWords.length - 1];
          const beforeLast = lineWords.slice(0, -1).join(" ");
          const offsetX = beforeLast
            ? ctx.measureText(beforeLast + " ").width / 2
            : -ctx.measureText(lastWord).width / 2;
          ctx.fillText(lastWord, W / 2 + offsetX + ctx.measureText(lastWord).width / 2, ly);
        }
        ctx.shadowBlur = 0;
      });

    } else {
      // minimal_quote — clean italic centered
      const fadeIn = Math.min(1, t / 0.15);
      const fadeOut = t > 0.8 ? Math.max(0, 1 - (t - 0.8) / 0.2) : 1;
      const alpha = fadeIn * fadeOut;

      ctx.globalAlpha = alpha;
      ctx.font = `300 italic 58px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxWidth = W - 200;
      const lines = wrapText(ctx, `"${lyric}"`, maxWidth);
      const lineH = 72;
      const startY = textY - ((lines.length - 1) * lineH) / 2;

      // Thin separator lines
      ctx.strokeStyle = palette.accent2 + "88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 120, startY - 40);
      ctx.lineTo(W / 2 + 120, startY - 40);
      ctx.stroke();

      lines.forEach((line, li) => {
        const ly = startY + li * lineH;
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(line, W / 2, ly);
        ctx.shadowBlur = 0;
      });

      ctx.beginPath();
      ctx.moveTo(W / 2 - 120, startY + lines.length * lineH - 30);
      ctx.lineTo(W / 2 + 120, startY + lines.length * lineH - 30);
      ctx.stroke();
    }
    ctx.restore();

    // --- TOP BAR: clip title ---
    ctx.save();
    const topFade = Math.min(1, t / 0.08) * (t > 0.9 ? Math.max(0, 1 - (t - 0.9) / 0.1) : 1);
    ctx.globalAlpha = topFade * 0.7;
    ctx.font = "bold 36px Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 10;
    ctx.fillText(clip.title || "", 60, 80);
    ctx.shadowBlur = 0;
    ctx.restore();

    // --- BOTTOM: SoundReady watermark ---
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.font = "bold 28px Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Made with SoundReady", W / 2, H - 60);
    ctx.restore();

    // --- PROGRESS BAR ---
    const barH = 4;
    const barY = H - 20;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(0, barY, W, barH);
    ctx.fillStyle = palette.accent2;
    ctx.fillRect(0, barY, W * t, barH);
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };
    recorder.onerror = reject;

    recorder.start();

    let frameIdx = 0;
    function renderNext() {
      if (frameIdx >= TOTAL_FRAMES) {
        recorder.stop();
        return;
      }
      drawFrame(frameIdx);
      frameIdx++;
      if (onProgress) onProgress(Math.round((frameIdx / TOTAL_FRAMES) * 100));
      // Use setTimeout to avoid blocking UI
      setTimeout(renderNext, 0);
    }
    renderNext();
  });
}