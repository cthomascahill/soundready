import { useRef, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function DrawingCanvas({ boardId, canvasOffset, activeTool, drawColor, drawWidth, userEmail }) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const isDrawing = useRef(false);

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

  // Render all strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allStrokes = currentStroke
      ? [...strokes, { points: currentStroke, color: drawColor, width: drawWidth }]
      : strokes;

    for (const stroke of allStrokes) {
      if (!stroke.points || stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color || "#111111";
      ctx.lineWidth = stroke.width || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const [first, ...rest] = stroke.points;
      ctx.moveTo(first.x + canvasOffset.x, first.y + canvasOffset.y);
      for (const pt of rest) {
        ctx.lineTo(pt.x + canvasOffset.x, pt.y + canvasOffset.y);
      }
      ctx.stroke();
    }
  }, [strokes, currentStroke, canvasOffset, drawColor, drawWidth]);

  // Resize canvas to fill parent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
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

  const onMouseDown = useCallback((e) => {
    if (activeTool !== "draw" && activeTool !== "eraser") return;
    e.stopPropagation();
    isDrawing.current = true;
    setCurrentStroke([getPos(e)]);
  }, [activeTool, canvasOffset]);

  const onMouseMove = useCallback((e) => {
    if (!isDrawing.current) return;
    e.stopPropagation();
    setCurrentStroke((prev) => prev ? [...prev, getPos(e)] : [getPos(e)]);
  }, [canvasOffset]);

  const onMouseUp = useCallback(async (e) => {
    if (!isDrawing.current || !currentStroke || currentStroke.length < 2) {
      isDrawing.current = false;
      setCurrentStroke(null);
      return;
    }
    isDrawing.current = false;
    const stroke = currentStroke;
    setCurrentStroke(null);

    const saved = await base44.entities.WhiteboardStroke.create({
      board_id: boardId,
      points: stroke,
      color: activeTool === "eraser" ? "#ffffff" : drawColor,
      width: activeTool === "eraser" ? 24 : drawWidth,
      author_email: userEmail,
    });
    setStrokes((prev) => [...prev, saved]);
  }, [currentStroke, activeTool, drawColor, drawWidth, boardId, userEmail]);

  const isActive = activeTool === "draw" || activeTool === "eraser";

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: isActive ? "auto" : "none",
        cursor: activeTool === "eraser" ? "cell" : activeTool === "draw" ? "crosshair" : "default",
        zIndex: 10,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}