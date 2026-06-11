import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import WhiteboardBlock from "@/components/whiteboard/WhiteboardBlock";
import WhiteboardToolbar from "@/components/whiteboard/WhiteboardToolbar";
import WhiteboardTopBar from "@/components/whiteboard/WhiteboardTopBar";

export default function WhiteboardCanvas() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [tool, setTool] = useState("select"); // select | text | heading | bullet
  const canvasRef = useRef(null);
  const lastSaveRef = useRef({});

  useEffect(() => {
    init();
  }, [boardId]);

  const init = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const [b, bls] = await Promise.all([
      base44.entities.Whiteboard.filter({ id: boardId }, "", 1).then((r) => r[0]),
      base44.entities.WhiteboardBlock.filter({ board_id: boardId }, "created_date", 200),
    ]);
    setBoard(b);
    setBlocks(bls || []);
    setLoading(false);
  };

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.WhiteboardBlock.subscribe((event) => {
      if (event.data?.board_id !== boardId) return;
      if (event.type === "create") {
        setBlocks((prev) => {
          if (prev.find((b) => b.id === event.id)) return prev;
          return [...prev, event.data];
        });
      } else if (event.type === "update") {
        setBlocks((prev) => prev.map((b) => b.id === event.id ? event.data : b));
      } else if (event.type === "delete") {
        setBlocks((prev) => prev.filter((b) => b.id !== event.id));
      }
    });
    return unsub;
  }, [boardId]);

  const addBlock = async (e) => {
    if (tool === "select" || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - canvasOffset.x;
    const y = e.clientY - rect.top - canvasOffset.y;

    const newBlock = await base44.entities.WhiteboardBlock.create({
      board_id: boardId,
      content: "",
      x: Math.round(x),
      y: Math.round(y),
      width: 320,
      block_type: tool,
      styles: { bold: false, underline: false, fontSize: "medium", color: "#111111" },
      z_index: blocks.length + 1,
      author_email: user?.email,
    });
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setTool("select");
  };

  const updateBlock = useCallback(async (id, patch) => {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...patch } : b));
    // Debounce saves
    clearTimeout(lastSaveRef.current[id]);
    lastSaveRef.current[id] = setTimeout(async () => {
      await base44.entities.WhiteboardBlock.update(id, patch);
    }, 400);
  }, []);

  const deleteBlock = async (id) => {
    await base44.entities.WhiteboardBlock.delete(id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlockId(null);
  };

  // Pan handling
  const onMouseDown = (e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains("canvas-bg")) return;
    if (tool === "select") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      setSelectedBlockId(null);
    }
  };

  const onMouseMove = (e) => {
    if (!isPanning || !panStart) return;
    setCanvasOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const onMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none" style={{ background: "#ffffff" }}>
      <WhiteboardTopBar
        board={board}
        user={user}
        blockCount={blocks.length}
        onBoardUpdate={(patch) => {
          setBoard((b) => ({ ...b, ...patch }));
          base44.entities.Whiteboard.update(boardId, patch);
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <WhiteboardToolbar tool={tool} onToolChange={setTool} selectedBlock={selectedBlock} onStyleChange={(patch) => selectedBlock && updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, ...patch } })} />

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden canvas-bg ${tool !== "select" ? "cursor-crosshair" : isPanning ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ background: "#ffffff" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onClick={addBlock}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none canvas-bg"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              backgroundPosition: `${canvasOffset.x % 32}px ${canvasOffset.y % 32}px`,
            }}
          />

          {/* Hint when empty */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none canvas-bg">
              <div className="text-center space-y-2 canvas-bg">
                <p className="text-black/20 text-xl font-heading">Click to add a text block</p>
                <p className="text-black/10 text-sm">or select a tool from the left panel</p>
              </div>
            </div>
          )}

          {/* Blocks */}
          <div
            style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`, position: "absolute", top: 0, left: 0 }}
          >
            {blocks.map((block) => (
              <WhiteboardBlock
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                currentUserEmail={user?.email}
                onSelect={() => setSelectedBlockId(block.id)}
                onDeselect={() => setSelectedBlockId(null)}
                onUpdate={(patch) => updateBlock(block.id, patch)}
                onDelete={() => deleteBlock(block.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}