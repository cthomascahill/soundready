import { MousePointer2, Type, Heading, List, Bold, Underline, Pencil, Eraser } from "lucide-react";

const TOOLS = [
  { id: "select", icon: MousePointer2, label: "Select / Pan" },
  { id: "draw", icon: Pencil, label: "Draw" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "text", icon: Type, label: "Text Block" },
  { id: "heading", icon: Heading, label: "Heading Block" },
  { id: "bullet", icon: List, label: "Bullet List Block" },
];

const FONT_SIZES = [
  { id: "small", label: "S" },
  { id: "medium", label: "M" },
  { id: "large", label: "L" },
];

const TEXT_COLORS = ["#111111", "#ffffff", "#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#facc15", "#a78bfa", "#f87171"];
const DRAW_COLORS = ["#111111", "#ef4444", "#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#facc15", "#a78bfa"];
const DRAW_WIDTHS = [2, 4, 8, 16];

export default function WhiteboardToolbar({ tool, onToolChange, selectedBlock, onStyleChange, drawColor, drawWidth, onDrawColorChange, onDrawWidthChange }) {
  const styles = selectedBlock?.styles || {};
  const isDrawTool = tool === "draw" || tool === "eraser";

  return (
    <div className="w-14 flex flex-col items-center py-4 gap-1 border-r border-white/5 bg-[#111] shrink-0 overflow-y-auto">
      {/* Tools */}
      <div className="flex flex-col gap-1 w-full px-1.5 pb-3 border-b border-white/5">
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => onToolChange(id)}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all mx-auto ${tool === id ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Draw tool options */}
      {isDrawTool && tool !== "eraser" && (
        <div className="flex flex-col gap-2 pt-3 w-full px-1.5 items-center">
          <p className="text-[9px] text-white/30 uppercase tracking-wider">Color</p>
          <div className="flex flex-col gap-1.5 items-center">
            {DRAW_COLORS.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => onDrawColorChange(c)}
                className={`h-5 w-5 rounded-full transition-all border-2 ${drawColor === c ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="w-8 h-px bg-white/10 my-1" />
          <p className="text-[9px] text-white/30 uppercase tracking-wider">Size</p>
          <div className="flex flex-col gap-1.5 items-center">
            {DRAW_WIDTHS.map((w) => (
              <button
                key={w}
                title={`${w}px`}
                onClick={() => onDrawWidthChange(w)}
                className={`flex items-center justify-center h-8 w-10 rounded-lg transition-all ${drawWidth === w ? "bg-primary/30 border border-primary" : "hover:bg-white/8"}`}
              >
                <div className="rounded-full bg-white" style={{ width: Math.min(w * 1.5, 24), height: Math.min(w * 1.5, 24) }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Styling — only when text block selected */}
      {selectedBlock && !isDrawTool && (
        <div className="flex flex-col gap-2 pt-3 w-full px-1.5 items-center">
          <button
            title="Bold"
            onClick={() => onStyleChange({ bold: !styles.bold })}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${styles.bold ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            title="Underline"
            onClick={() => onStyleChange({ underline: !styles.underline })}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${styles.underline ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="flex flex-col gap-1 w-full">
            {FONT_SIZES.map((s) => (
              <button
                key={s.id}
                title={`Size ${s.label}`}
                onClick={() => onStyleChange({ fontSize: s.id })}
                className={`h-8 w-10 rounded-lg mx-auto text-xs font-bold transition-all ${styles.fontSize === s.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white hover:bg-white/8"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="w-8 h-px bg-white/10 my-1" />
          <div className="flex flex-col gap-1.5 items-center">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => onStyleChange({ color: c })}
                className={`h-5 w-5 rounded-full transition-all border-2 ${styles.color === c ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}