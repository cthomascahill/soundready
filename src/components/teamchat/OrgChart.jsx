import { useState } from "react";
import { Users, Edit2, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ROLE_PRESETS = ["Artist", "Manager", "Producer", "Engineer", "Graphic Designer", "A&R", "Publicist", "Tour Manager", "Booking Agent", "Label Rep"];

const ROLE_COLORS = {
  "Manager": "border-yellow-500/40 bg-yellow-500/5 text-yellow-400",
  "Producer": "border-primary/40 bg-primary/5 text-primary",
  "Graphic Designer": "border-purple-500/40 bg-purple-500/5 text-purple-400",
  "Engineer": "border-cyan-500/40 bg-cyan-500/5 text-cyan-400",
  "A&R": "border-pink-500/40 bg-pink-500/5 text-pink-400",
  "Artist": "border-orange-500/40 bg-orange-500/5 text-orange-400",
  "Tour Manager": "border-blue-500/40 bg-blue-500/5 text-blue-400",
  "Publicist": "border-red-500/40 bg-red-500/5 text-red-400",
  "Booking Agent": "border-teal-500/40 bg-teal-500/5 text-teal-400",
  "Label Rep": "border-chart-5/40 bg-chart-5/5 text-chart-5",
  "default": "border-border bg-card text-muted-foreground",
};

function getRoleStyle(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.default;
}

function MemberCard({ member, currentUserEmail, onStartDM, onUpdateRole }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(member.role_label || "");
  const [saving, setSaving] = useState(false);
  const isYou = member.email === currentUserEmail;

  const save = async () => {
    setSaving(true);
    await base44.entities.TeamMember.update(member.id, { role_label: role });
    onUpdateRole(member.id, role);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className={`rounded-2xl border p-5 flex flex-col items-center gap-3 text-center transition-all hover:border-primary/30 ${getRoleStyle(member.role_label)}`}>
      <div className="h-14 w-14 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
        {(member.name || member.email)[0].toUpperCase()}
      </div>
      <div className="w-full">
        <p className="font-semibold text-sm text-foreground truncate">{member.name || member.email.split("@")[0]}</p>
        <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>

        {editing ? (
          <div className="mt-2 space-y-1.5">
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full h-7 rounded-md border border-input bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">No role</option>
              {ROLE_PRESETS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Or type custom role..."
              className="w-full h-7 rounded-md border border-input bg-card px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <div className="flex gap-1 justify-center">
              <button onClick={save} disabled={saving}
                className="h-6 px-2 rounded bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1 hover:bg-primary/90">
                <Check className="h-3 w-3" />{saving ? "..." : "Save"}
              </button>
              <button onClick={() => { setEditing(false); setRole(member.role_label || ""); }}
                className="h-6 px-2 rounded bg-secondary text-muted-foreground text-[10px] hover:text-foreground flex items-center gap-1">
                <X className="h-3 w-3" />Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center justify-center gap-1">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getRoleStyle(member.role_label)}`}>
              {member.role_label || "No role set"}
            </span>
            <button onClick={() => setEditing(true)} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <Edit2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {!isYou && (
        <button onClick={() => onStartDM(member.email)}
          className="w-full h-7 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
          Message
        </button>
      )}
      {isYou && <span className="text-[10px] text-primary font-semibold">You</span>}
    </div>
  );
}

export default function OrgChart({ teamMembers, currentUserEmail, onStartDM, onUpdateRole }) {
  if (teamMembers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-3 text-center">
        <Users className="h-12 w-12 text-muted-foreground/20" />
        <p className="font-heading font-semibold text-lg">No team members yet</p>
        <p className="text-sm text-muted-foreground">Invite teammates using the sidebar to build your org chart.</p>
      </div>
    );
  }

  // Group by role
  const grouped = {};
  teamMembers.forEach(m => {
    const role = m.role_label || "No Role";
    if (!grouped[role]) grouped[role] = [];
    grouped[role].push(m);
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
      <div>
        <p className="text-xs text-primary uppercase tracking-widest font-medium mb-1">Org Chart</p>
        <h1 className="font-heading text-2xl font-bold">Your Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}</p>
      </div>

      {Object.entries(grouped).map(([role, members]) => (
        <div key={role}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">{role}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {members.map(m => (
              <MemberCard key={m.id || m.email} member={m} currentUserEmail={currentUserEmail} onStartDM={onStartDM} onUpdateRole={onUpdateRole} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}