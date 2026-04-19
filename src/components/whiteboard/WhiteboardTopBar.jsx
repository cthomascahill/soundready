import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Check, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WhiteboardTopBar({ board, user, blockCount, onBoardUpdate }) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(board?.name || "Untitled");
  const [copied, setCopied] = useState(false);

  const saveName = () => {
    setEditingName(false);
    if (name.trim() && name !== board?.name) {
      onBoardUpdate({ name: name.trim() });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[#111] shrink-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link to="/whiteboard" className="text-white/40 hover:text-white transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {editingName ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            autoFocus
            className="h-7 w-48 bg-white/10 border-white/20 text-white text-sm px-2"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors group min-w-0"
          >
            <span className="truncate max-w-[160px]">{board?.name || "Untitled"}</span>
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
          </button>
        )}

        <span className="text-white/20 text-xs hidden sm:block shrink-0">{blockCount} block{blockCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Center: auto-save indicator */}
      <div className="flex items-center gap-1.5 text-xs text-white/30 absolute left-1/2 -translate-x-1/2 hidden sm:flex">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Auto-saving
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {user && (
          <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            {(user.full_name || user.email || "?")[0].toUpperCase()}
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10"
          onClick={copyLink}
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Share2 className="h-3 w-3" />}
          {copied ? "Copied!" : "Share"}
        </Button>
      </div>
    </div>
  );
}