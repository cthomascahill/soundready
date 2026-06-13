import { useRef, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Draw a single expo-marker stroke on a canvas context
function drawExpoStroke(ctx, points, color, width, opacity = 0.82) {
  if (!points || points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "multiply"; // ink layering feel
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Slight chisel/flat tip: draw two offset strokes at reduced alpha
  for (let offset of [-width * 0.18, 0, width * 0.18]) {
    ctx.beginPath();
    ctx.globalAlpha = offset === 0 ? opacity : opacity * 0.35;
    const [first, ...rest] = points;
    ctx.moveTo(first.x + offset, first.y);
    for (let i = 0; i < rest.length; i++) {
      const pt = rest[i];
      if (i === 0) {
        ctx.lineTo(pt.x + offset, pt.y);
      } else {
        // Smooth curve
        const prev = rest[i - 1];
        const mx = (prev.x + pt.x) / 2 + offset;
        const my = (prev.y + pt.y) / 2;
        ctx.quadraticCurveTo(prev.x + offset, prev.y, mx, my);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

export default function DrawingCanvas({ boardId, canvasOffset, activeTool, drawColor, drawWidth, userEmail }) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const currentStrokeRef = useRef(null);
  const isDrawing = useRef(false);
  const animFrameRef = useRef(null);

  // Load existing strokes
  useEffect(() => {
    base44.entities.WhiteboardStroke.filter({ board_id: boardId }, "created_date", 500)
      .then(setStrokes)
      .catch(() => {});
  }, [boardId]);

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.WhiteboardStroke.subscribe((event) => {
      if (event.data?.board_id !== boardId) return;
      if (event.type === "create") {
        setStrokes((prev) => prev.find((s) => s.id === event.id) ? prev : [...prev, event.data]);
      } else if (event.type === "delete") {
        setStrokes((prev) => prev.filter((s) => s.id !== event.id));
      }
    });
    return unsub;
  }, [boardId]);

  // Full re-render whenever strokes/offset changes
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allStrokes = currentStrokeRef.current
      ? [...strokes, {
          points: currentStrokeRef.current,
          color: activeTool === "eraser" ? "#ffffff" : drawColor,
          width: activeTool === "eraser" ? 28 : drawWidth,
        }]
      : strokes;

    for (const stroke of allStrokes) {
      if (!stroke.points || stroke.points.length < 2) continue;
      const pts = stroke.points.map((p) => ({
        x: p.x + canvasOffset.x,
        y: p.y + canvasOffset.y,
      }));

      if (stroke.color === "#ffffff") {
        // Eraser: just clear
        const ctx2 = canvas.getContext("2d");
        ctx2.save();
        ctx2.globalCompositeOperation = "destination-out";
        ctx2.strokeStyle = "rgba(0,0,0,1)";
        ctx2.lineWidth = stroke.width;
        ctx2.lineCap = "round";
        ctx2.lineJoin = "round";
        ctx2.beginPath();
        const [f, ...r] = pts;
        ctx2.moveTo(f.x, f.y);
        r.forEach((p) => ctx2.lineTo(p.x, p.y));
        ctx2.stroke();
        ctx2.restore();
      } else {
        drawExpoStroke(ctx, pts, stroke.color || "#111111", stroke.width || 6, 0.8);
      }
    }
  }, [strokes, canvasOffset, drawColor, drawWidth, activeTool]);

  useEffect(() => {
    render();
  }, [render]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      render();
    });
    observer.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return () => observer.disconnect();
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left - canvasOffset.x,
      y: clientY - rect.top - canvasOffset.y,
    };
  };

  const scheduleRender = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(render);
  };

  const onMouseDown = useCallback((e) => {
    if (activeTool !== "draw" && activeTool !== "eraser") return;
    e.stopPropagation();
    isDrawing.current = true;
    currentStrokeRef.current = [getPos(e)];
    scheduleRender();
  }, [activeTool, canvasOffset]);

  const onMouseMove = useCallback((e) => {
    if (!isDrawing.current) return;
    e.stopPropagation();
    currentStrokeRef.current = [...(currentStrokeRef.current || []), getPos(e)];
    scheduleRender();
  }, [canvasOffset]);

  const onMouseUp = useCallback(async () => {
    if (!isDrawing.current || !currentStrokeRef.current || currentStrokeRef.current.length < 2) {
      isDrawing.current = false;
      currentStrokeRef.current = null;
      return;
    }
    isDrawing.current = false;
    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    scheduleRender();

    const saved = await base44.entities.WhiteboardStroke.create({
      board_id: boardId,
      points: stroke,
      color: activeTool === "eraser" ? "#ffffff" : drawColor,
      width: activeTool === "eraser" ? 28 : drawWidth,
      author_email: userEmail,
    });
    setStrokes((prev) => [...prev, saved]);
  }, [activeTool, drawColor, drawWidth, boardId, userEmail]);

  const isActive = activeTool === "draw" || activeTool === "eraser";

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: isActive ? "auto" : "none",
        cursor: "none",
        zIndex: 10,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}