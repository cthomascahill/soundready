import { useEffect, useRef } from "react";

export default function WaveformBg({ bpm }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const phase = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const speed = (bpm / 60) * 0.012;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const lines = 5;
      for (let l = 0; l < lines; l++) {
        ctx.beginPath();
        const amp = 6 + l * 4;
        const freq = 0.008 + l * 0.003;
        const yBase = h * (0.3 + l * 0.1);
        const alpha = 0.04 + l * 0.015;

        ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
        ctx.lineWidth = 1;

        for (let x = 0; x < w; x++) {
          const y = yBase + Math.sin(x * freq + phase.current + l) * amp
            + Math.sin(x * freq * 2.3 + phase.current * 1.5) * (amp * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase.current += speed;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [bpm]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
    />
  );
}