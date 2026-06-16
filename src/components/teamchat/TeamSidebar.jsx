import { useState } from "react";
import { Hash, MessageCircle, Users, ChevronDown, ChevronRight, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CHANNELS = [
  { id: "general", label: "general" },
  { id: "releases", label: "releases" },
  { id: "ideas", label: "ideas" },
];

const ROLE_COLORS = {
  "Manager": "text-yellow-400",
  "Producer": "text-primary",
  "Graphic Designer": "text-purple-400",
  "Engineer": "text-cyan-400",
  "A&R": "text-pink-400",
  "Artist": "text-orange-400",
  "default": "text-muted-foreground",
};

function getRoleColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.default;
}

export default function TeamSidebar({ user, activeChannel, setActiveChannel, teamMembers, view, setView }) {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);

  const dmMembers = teamMembers.filter(m => m.email !== user?.email);

  const getDMChannel = (email) => {
    const sorted = [user?.email, email].sort();
    return `dm|||${sorted[0]}|||${sorted[1]}`;
  };

  const openDM = (memberEmail) => {
    setActiveChannel(getDMChannel(memberEmail));
    setView("chat");
  };

  const isDMActive = (memberEmail) => activeChannel === getDMChannel(memberEmail);

  const invite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    setInviteStatus(null);
    try {
      await base44.users.inviteUser(email, "user");
      // Save to TeamMember entity
      await base44.entities.TeamMember.create({
        email,
        role_label: inviteRole.trim() || "Team Member",
        invited_by: user?.email,
      });
      setInviteStatus("success");
      setInviteEmail("");
      setInviteRole("");
    } catch {
      setInviteStatus("error");
    }
    setInviting(false);
    setTimeout(() => setInviteStatus(null), 4000);
  };

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-[hsl(0,0%,5%)] flex flex-col h-screen">
      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="font-heading font-bold text-sm truncate">SoundReady</p>
        <p className="text-[10px] text-muted-foreground">Workspace</p>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-0.5 px-2 pt-2">
        <button onClick={() => setView("chat")}
          className={`flex-1 text-[10px] py-1 rounded font-semibold transition-colors ${view === "chat" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          Chat
        </button>
        <button onClick={() => setView("team")}
          className={`flex-1 text-[10px] py-1 rounded font-semibold transition-colors ${view === "team" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          Team
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Channels */}
        <div className="mb-1">
          <button onClick={() => setChannelsOpen(v => !v)}
            className="w-full flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
            {channelsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Channels
          </button>
          {channelsOpen && CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => { setActiveChannel(ch.id); setView("chat"); }}
              className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors rounded-md mx-1 ${activeChannel === ch.id && view === "chat" ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
              <Hash className="h-3.5 w-3.5 shrink-0" />
              {ch.label}
            </button>
          ))}
        </div>

        {/* Direct Messages */}
        <div className="mt-2">
          <button onClick={() => setDmsOpen(v => !v)}
            className="w-full flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
            {dmsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Direct Messages
          </button>
          {dmsOpen && (
            <>
              {dmMembers.length === 0 && (
                <p className="px-4 py-2 text-xs text-muted-foreground/60">Invite teammates to DM them</p>
              )}
              {dmMembers.map(m => (
                <button key={m.email} onClick={() => openDM(m.email)}
                  className={`w-full flex items-center gap-2 px-4 py-1.5 rounded-md mx-1 text-sm transition-colors ${isDMActive(m.email) && view === "chat" ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                    {(m.name || m.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs truncate">{m.name || m.email.split("@")[0]}</p>
                    {m.role_label && (
                      <p className={`text-[9px] truncate ${getRoleColor(m.role_label)}`}>{m.role_label}</p>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Invite */}
      <div className="border-t border-border p-3 space-y-2">
        <button onClick={() => setInviteOpen(v => !v)}
          className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <UserPlus className="h-3.5 w-3.5" />
          Invite teammate
          <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${inviteOpen ? "rotate-180" : ""}`} />
        </button>
        {inviteOpen && (
          <div className="space-y-1.5">
            <input type="email" placeholder="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && invite()}
              className="w-full h-7 rounded-md border border-input bg-transparent px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <input type="text" placeholder="Role (e.g. Producer, Manager)" value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && invite()}
              className="w-full h-7 rounded-md border border-input bg-transparent px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <button onClick={invite} disabled={inviting || !inviteEmail.trim()}
              className="w-full h-7 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40">
              {inviting ? "Sending..." : "Send Invite"}
            </button>
            {inviteStatus === "success" && <p className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Invite sent!</p>}
            {inviteStatus === "error" && <p className="text-[10px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed to invite.</p>}
          </div>
        )}
      </div>

      {/* Current user */}
      <div className="px-3 py-2 border-t border-border flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {(user?.full_name || user?.email || "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{user?.full_name || user?.email?.split("@")[0]}</p>
          <p className="text-[10px] text-primary truncate">You</p>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
      </div>
    </aside>
  );
}