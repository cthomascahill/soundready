import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Share2, Check, Edit3, UserPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WhiteboardTopBar({ board, user, blockCount, onBoardUpdate }) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(board?.name || "Untitled");
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

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

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await base44.users.inviteUser(inviteEmail.trim(), "user");
    setInviteSent(true);
    setInviteEmail("");
    setTimeout(() => { setInviteSent(false); setShowInvite(false); }, 2000);
  };

  const handleExportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>${board?.name || "Whiteboard"}</title><style>body{font-family:sans-serif;background:#fff;padding:40px;color:#111;}</style></head><body>`);
    win.document.write(`<h1>${board?.name || "Whiteboard"}</h1><p style="color:#888;font-size:13px;">Exported ${new Date().toLocaleDateString()}</p><hr/>`);
    win.document.write(`<p style="color:#aaa;font-size:12px;">Open the whiteboard and use your browser's Print → Save as PDF to get a full visual snapshot of the canvas.</p>`);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
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

        {showInvite ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleInvite()}
              placeholder="Email address..."
              className="h-7 w-44 bg-white/10 border-white/20 text-white text-xs px-2"
              autoFocus
            />
            <Button size="sm" className="h-7 text-xs px-2" onClick={handleInvite}>
              {inviteSent ? <Check className="h-3 w-3" /> : "Invite"}
            </Button>
            <button onClick={() => setShowInvite(false)} className="text-white/40 hover:text-white text-xs">✕</button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => setShowInvite(true)}>
            <UserPlus className="h-3 w-3" /> Invite
          </Button>
        )}

        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={handleExportPDF}>
          <Download className="h-3 w-3" /> PDF
        </Button>

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