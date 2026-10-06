import { useEffect, useState } from "react";
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// "Invite teammate" button on the Tracker: invites an email to the app,
// saves them as a TeamMember, and gives them read access to your Tracker.
export default function InviteTeammateButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [inviting, setInviting] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error"
  const [teammates, setTeammates] = useState([]);

  const loadTeammates = () =>
    base44.entities.TeamMember.list("-created_date", 100)
      .then((members) => setTeammates(members))
      .catch(() => {});

  useEffect(() => {
    if (open) loadTeammates();
  }, [open]);

  const invite = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setInviting(true);
    setStatus(null);
    try {
      // Invite them to the app; if they already have an account this fails silently
      await base44.users.inviteUser(trimmed, "user").catch(() => {});
      await base44.entities.TeamMember.create({
        email: trimmed,
        role_label: role.trim() || "Teammate",
        invited_by: user?.email,
      });
      setStatus("success");
      setEmail("");
      setRole("");
      loadTeammates();
    } catch {
      setStatus("error");
    }
    setInviting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" /> Invite Teammate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Invite a teammate</DialogTitle>
          <DialogDescription>
            They get access to view your Tracker — songs, stages and mix files — read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="teammate@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()}
          />
          <Input
            type="text"
            placeholder="Role (e.g. Engineer, Manager)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && invite()}
          />
          <Button onClick={invite} disabled={inviting || !email.trim()} className="w-full gap-2">
            {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {inviting ? "Inviting..." : "Send Invite"}
          </Button>
          {status === "success" && (
            <p className="text-xs text-green-500 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Invited — they'll see your Tracker under "Shared with me" when they log in.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Couldn't invite them. Try again.
            </p>
          )}
        </div>

        {teammates.length > 0 && (
          <div className="border-t border-border pt-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your teammates
            </p>
            {teammates.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {(m.email || "?")[0].toUpperCase()}
                </div>
                <span className="truncate flex-1">{m.email}</span>
                <span className="text-[10px] text-muted-foreground truncate">{m.role_label}</span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}