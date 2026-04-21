import { useState, useRef, useEffect } from "react";
import { Trash2, GripVertical } from "lucide-react";

const FONT_SIZES = {
  small: "14px",
  medium: "18px",
  large: "28px",
};

const BLOCK_TYPE_PLACEHOLDER = {
  text: "Type something...",
  heading: "Heading...",
  bullet: "• List item...",
};

export default function WhiteboardBlock({ block, isSelected, currentUserEmail, onSelect, onDeselect, onUpdate, onDelete }) {
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (isSelected && textRef.current) {
      textRef.current.focus();
    }
  }, [isSelected]);

  const onDragMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    setDragStart({ mx: e.clientX, my: e.clientY, bx: block.x, by: block.y });
    onSelect();
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - dragStart.mx;
      const dy = e.clientY - dragStart.my;
      onUpdate({ x: dragStart.bx + dx, y: dragStart.by + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, dragStart]);

  const styles = block.styles || {};
  const fontSize = FONT_SIZES[styles.fontSize || "medium"];
  const color = styles.color || "#ffffff";

  const textStyle = {
    fontSize,
    color,
    fontWeight: styles.bold ? "700" : block.block_type === "heading" ? "800" : "400",
    textDecoration: styles.underline ? "underline" : "none",
    fontStyle: "normal",
    lineHeight: block.block_type === "heading" ? "1.2" : "1.6",
    fontFamily: block.block_type === "heading" ? "'Space Grotesk', sans-serif" : "inherit",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: block.x,
        top: block.y,
        width: block.width || 320,
        zIndex: isSelected ? 1000 : block.z_index || 1,
      }}
      className={`group ${dragging ? "opacity-80" : ""}`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Drag handle + delete (visible on hover/select) */}
      {isSelected && (
        <div className="absolute -top-8 left-0 flex items-center gap-1">
          <div
            onMouseDown={onDragMouseDown}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 border border-white/20 cursor-grab active:cursor-grabbing text-white/60 hover:text-white text-xs"
          >
            <GripVertical className="h-3 w-3" />
            drag
          </div>
          <button
            onMouseDown={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-md bg-destructive/20 border border-destructive/30 text-destructive hover:bg-destructive/40 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Block border */}
      <div className={`rounded-xl border transition-all ${isSelected ? "border-primary/60 shadow-lg shadow-primary/10" : "border-transparent hover:border-white/10"}`}>
        <textarea
          ref={textRef}
          value={block.content || ""}
          placeholder={BLOCK_TYPE_PLACEHOLDER[block.block_type || "text"]}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onFocus={onSelect}
          onBlur={() => {}}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            ...textStyle,
            background: isSelected ? "rgba(255,255,255,0.04)" : "transparent",
            border: "none",
            outline: "none",
            resize: "horizontal",
            padding: "12px 16px",
            width: "100%",
            minHeight: block.block_type === "heading" ? "56px" : "48px",
            borderRadius: "12px",
            caretColor: "hsl(var(--primary))",
          }}
          className="placeholder:text-white/20 text-white"
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
            if (e.target.style.width !== (block.width + "px")) {
              onUpdate({ width: parseInt(e.target.style.width) || block.width });
            }
          }}
        />
      </div>
    </div>
  );
}