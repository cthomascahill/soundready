import { MousePointer2, Type, Heading, List, Bold, Underline, Minus } from "lucide-react";

const TOOLS = [
  { id: "select", icon: MousePointer2, label: "Select / Pan" },
  { id: "text", icon: Type, label: "Text" },
  { id: "heading", icon: Heading, label: "Heading" },
  { id: "bullet", icon: List, label: "Bullet List" },
];

const FONT_SIZES = [
  { id: "small", label: "S" },
  { id: "medium", label: "M" },
  { id: "large", label: "L" },
];

const COLORS = ["#ffffff", "#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#facc15", "#a78bfa", "#f87171"];

export default function WhiteboardToolbar({ tool, onToolChange, selectedBlock, onStyleChange }) {
  const styles = selectedBlock?.styles || {};

  return (
    <div className="w-14 flex flex-col items-center py-4 gap-1 border-r border-white/5 bg-[#111] shrink-0">
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

      {/* Styling — only when block selected */}
      {selectedBlock && (
        <div className="flex flex-col gap-2 pt-3 w-full px-1.5 items-center">
          {/* Bold */}
          <button
            title="Bold"
            onClick={() => onStyleChange({ bold: !styles.bold })}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${styles.bold ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Bold className="h-4 w-4" />
          </button>

          {/* Underline */}
          <button
            title="Underline"
            onClick={() => onStyleChange({ underline: !styles.underline })}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all ${styles.underline ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Underline className="h-4 w-4" />
          </button>

          {/* Font size */}
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

          {/* Divider */}
          <div className="w-8 h-px bg-white/10 my-1" />

          {/* Colors */}
          <div className="flex flex-col gap-1.5 items-center">
            {COLORS.map((c) => (
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