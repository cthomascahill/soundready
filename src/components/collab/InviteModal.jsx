import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, UserPlus } from "lucide-react";

const ROLES = [
  { value: "viewer", label: "Viewer", desc: "Can view report & checklist" },
  { value: "editor", label: "Editor", desc: "Can edit checklist & leave comments" },
  { value: "admin", label: "Admin", desc: "Full access including re-inviting others" },
];

export default function InviteModal({ song, user, onClose, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async () => {
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email."); return; }
    setLoading(true);
    setError("");
    await base44.entities.ReportCollaborator.create({
      song_analysis_id: song.id,
      song_title: song.title,
      invited_by_email: user.email,
      invited_by_name: user.full_name,
      collaborator_email: email.trim().toLowerCase(),
      role,
      status: "pending",
    });
    setLoading(false);
    onInvited();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg">Invite Collaborator</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{song.title} — {song.artist_name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium">Email address</label>
          <Input
            placeholder="collaborator@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium">Permission level</label>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <button key={r.value} onClick={() => setRole(r.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${role === r.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={handleInvite} disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Inviting..." : "Send Invite"}
          </Button>
        </div>
      </div>
    </div>
  );
}