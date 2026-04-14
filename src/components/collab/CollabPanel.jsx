import { useState, useEffect } from "react";
import { Users, UserPlus, Mail, X, Check, Shield, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReportCard, { CardHeader } from "../report/ReportCard";

const ROLE_LABELS = {
  viewer: { label: "Viewer", icon: Eye, desc: "Can view the report" },
  editor: { label: "Editor", icon: Shield, desc: "Can comment & discuss" },
};

export default function CollabPanel({ songAnalysisId, songTitle, currentUser }) {
  const [collaborators, setCollaborators] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songAnalysisId) { setLoading(false); return; }
    base44.entities.ReportCollaborator.filter({ song_analysis_id: songAnalysisId })
      .then(setCollaborators).finally(() => setLoading(false));
  }, [songAnalysisId]);

  const invite = async () => {
    if (!email.trim() || !songAnalysisId) return;
    setInviting(true);
    const collab = await base44.entities.ReportCollaborator.create({
      song_analysis_id: songAnalysisId,
      song_title: songTitle,
      invited_by_email: currentUser?.email || "",
      invited_by_name: currentUser?.full_name || "",
      collaborator_email: email.trim().toLowerCase(),
      role,
      status: "pending",
    });
    // Send invite email
    await base44.integrations.Core.SendEmail({
      to: email.trim(),
      subject: `You've been invited to collaborate on "${songTitle}"`,
      body: `Hi,\n\n${currentUser?.full_name || "An artist"} has invited you to collaborate on the SoundReady release plan for "${songTitle}" as a ${role}.\n\nLog in to SoundReady to view and collaborate on the report.\n\nBest,\nThe SoundReady Team`,
    });
    setCollaborators((prev) => [...prev, collab]);
    setEmail("");
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
    setInviting(false);
  };

  const remove = async (id) => {
    await base44.entities.ReportCollaborator.delete(id);
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  if (!songAnalysisId) {
    return (
      <ReportCard borderColor="border-l-chart-5">
        <CardHeader icon={Users} title="Collaborators" iconColor="text-chart-5" badge="Collab" />
        <div className="rounded-xl bg-secondary/30 border border-border p-5 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Save this report to your Library first to invite collaborators.</p>
        </div>
      </ReportCard>
    );
  }

  return (
    <ReportCard borderColor="border-l-chart-5">
      <CardHeader icon={Users} title="Collaborators" iconColor="text-chart-5" badge="Collab" />
      <p className="text-sm text-muted-foreground -mt-2">Invite band members, producers, or managers to view and discuss this report.</p>

      {/* Invite form */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Input
            placeholder="collaborator@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()}
            className="flex-1 h-10"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring shrink-0"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button size="sm" onClick={invite} disabled={inviting || !email.trim()}
            className="h-10 px-4 gap-1.5 shrink-0">
            {inviting ? <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : inviteSent ? <Check className="h-3.5 w-3.5" />
              : <UserPlus className="h-3.5 w-3.5" />}
            {inviteSent ? "Sent!" : "Invite"}
          </Button>
        </div>
      </div>

      {/* Collaborator list */}
      {loading ? (
        <div className="py-4 flex justify-center">
          <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : collaborators.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Active Collaborators</p>
          {collaborators.map((c) => {
            const RoleIcon = ROLE_LABELS[c.role]?.icon || Eye;
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-heading font-bold text-sm shrink-0">
                  {(c.collaborator_email[0] || "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.collaborator_email}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <RoleIcon className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground capitalize">{c.role}</p>
                    {c.status === "pending" && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-chart-4/15 text-chart-4 text-[10px] font-medium border border-chart-4/20">Pending</span>
                    )}
                  </div>
                </div>
                <button onClick={() => remove(c.id)}
                  className="h-7 w-7 rounded-lg hover:bg-secondary border border-transparent hover:border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-secondary/20 border border-dashed border-border p-5 text-center">
          <Mail className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No collaborators yet. Invite someone above.</p>
        </div>
      )}
    </ReportCard>
  );
}