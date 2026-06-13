import { MousePointer2, Type, Heading, List, Bold, Underline, Eraser } from "lucide-react";

// Expo markers: name, body color, cap color, ink color for drawing
const EXPO_MARKERS = [
  { id: "black",  label: "Black",   body: "#1a1a1a", cap: "#333",    ink: "#111111", width: 6 },
  { id: "red",    label: "Red",     body: "#c0392b", cap: "#e74c3c", ink: "#e53e3e", width: 6 },
  { id: "blue",   label: "Blue",    body: "#1a5276", cap: "#2980b9", ink: "#3b82f6", width: 6 },
  { id: "green",  label: "Green",   body: "#1e7a3e", cap: "#27ae60", ink: "#22c55e", width: 6 },
  { id: "purple", label: "Purple",  body: "#6c3483", cap: "#8e44ad", ink: "#a855f7", width: 6 },
  { id: "orange", label: "Orange",  body: "#ca6f1e", cap: "#e67e22", ink: "#f97316", width: 6 },
  { id: "pink",   label: "Pink",    body: "#a93226", cap: "#e91e8c", ink: "#ec4899", width: 6 },
  { id: "teal",   label: "Teal",    body: "#0e6655", cap: "#1abc9c", ink: "#14b8a6", width: 6 },
];

const NON_DRAW_TOOLS = [
  { id: "select", icon: MousePointer2, label: "Select / Pan" },
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

function ExpoMarker({ marker, isSelected, onClick }) {
  return (
    <button
      title={`${marker.label} marker`}
      onClick={onClick}
      className="group relative flex flex-col items-center transition-all duration-150"
      style={{ transform: isSelected ? "translateY(-4px) scale(1.08)" : "translateY(0) scale(1)" }}
    >
      {/* Marker body */}
      <div
        className="relative rounded-sm shadow-lg"
        style={{
          width: 22,
          height: 54,
          background: `linear-gradient(135deg, ${marker.cap} 0%, ${marker.body} 60%, #000 100%)`,
          boxShadow: isSelected
            ? `0 6px 18px ${marker.ink}66, inset 1px 0 0 rgba(255,255,255,0.15)`
            : `0 2px 6px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.1)`,
          border: isSelected ? `1px solid ${marker.ink}` : "1px solid rgba(0,0,0,0.3)",
        }}
      >
        {/* Cap */}
        <div
          className="absolute top-0 left-0 right-0 rounded-t-sm"
          style={{
            height: 16,
            background: `linear-gradient(180deg, ${marker.cap} 0%, ${marker.body} 100%)`,
            borderBottom: "1px solid rgba(0,0,0,0.3)",
          }}
        />
        {/* Label strip */}
        <div
          className="absolute inset-x-0 flex items-center justify-center"
          style={{ top: 18, height: 20 }}
        >
          <span
            className="text-white font-bold tracking-widest"
            style={{ fontSize: 6, textShadow: "0 1px 2px rgba(0,0,0,0.8)", writingMode: "horizontal-tb" }}
          >
            EXPO
          </span>
        </div>
        {/* Tip */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 6,
            height: 8,
            background: marker.ink,
            borderRadius: "0 0 3px 3px",
            boxShadow: `0 2px 4px ${marker.ink}88`,
          }}
        />
      </div>
      {/* Selected ring glow */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-sm pointer-events-none"
          style={{ boxShadow: `0 0 0 2px ${marker.ink}, 0 0 12px ${marker.ink}55` }}
        />
      )}
    </button>
  );
}

export default function WhiteboardToolbar({ tool, onToolChange, selectedBlock, onStyleChange, drawColor, drawWidth, onDrawColorChange, onDrawWidthChange }) {
  const styles = selectedBlock?.styles || {};
  const isDrawTool = tool === "draw" || tool === "eraser";
  const selectedMarker = EXPO_MARKERS.find((m) => m.ink === drawColor);

  const pickMarker = (marker) => {
    onDrawColorChange(marker.ink);
    onDrawWidthChange(marker.width);
    onToolChange("draw");
  };

  return (
    <div className="w-16 flex flex-col items-center py-3 gap-2 border-r border-white/5 bg-[#111] shrink-0 overflow-y-auto">

      {/* Non-draw tools */}
      <div className="flex flex-col gap-1 w-full px-1.5 pb-3 border-b border-white/5">
        {NON_DRAW_TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => onToolChange(id)}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all mx-auto ${tool === id ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        {/* Eraser */}
        <button
          title="Eraser"
          onClick={() => onToolChange("eraser")}
          className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all mx-auto ${tool === "eraser" ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white hover:bg-white/8"}`}
        >
          <Eraser className="h-4 w-4" />
        </button>
      </div>

      {/* Expo markers tray */}
      <div className="flex flex-col items-center gap-3 pt-2 pb-2 w-full px-1">
        <p className="text-[8px] text-white/25 uppercase tracking-widest font-bold">Markers</p>
        <div className="flex flex-col gap-2.5 items-center">
          {EXPO_MARKERS.map((marker) => (
            <ExpoMarker
              key={marker.id}
              marker={marker}
              isSelected={tool === "draw" && drawColor === marker.ink}
              onClick={() => pickMarker(marker)}
            />
          ))}
        </div>
      </div>

      {/* Styling — only when text block selected */}
      {selectedBlock && !isDrawTool && (
        <div className="flex flex-col gap-2 pt-2 w-full px-1.5 items-center border-t border-white/5">
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