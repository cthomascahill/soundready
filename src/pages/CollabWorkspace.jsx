import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Users, Music2, Plus, Lock, ChevronRight, UserPlus, CheckSquare, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import InviteModal from "@/components/collab/InviteModal";
import CollabChecklist from "@/components/collab/CollabChecklist";
import CollabMemberRow from "@/components/collab/CollabMemberRow";

export default function CollabWorkspace() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPro = user?.plan === "pro" || user?.plan === "label";

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.SongAnalysis.filter({ status: "complete", created_by: user.email }, "-created_date", 30),
      base44.entities.ReportCollaborator.list("-created_date", 100),
    ]).then(([songData, collabData]) => {
      setSongs(songData);
      setCollabs(collabData);
      if (songData.length > 0) setSelectedSong(songData[0]);
      setLoading(false);
    });
  }, [user?.email]);

  const songCollabs = collabs.filter((c) => c.song_analysis_id === selectedSong?.id);
  const isOwner = selectedSong?.created_by === user?.email;

  // Find this user's collab record for the selected song (if invited)
  const myCollab = songCollabs.find((c) => c.collaborator_email === user?.email);
  const myRole = isOwner ? "admin" : myCollab?.role;
  const canEdit = isOwner || myRole === "editor" || myRole === "admin";

  // My own collab record for checklist use
  const checklistCollab = isOwner
    ? songCollabs[0] // owner uses first collab or we create a synthetic one
    : myCollab;

  const handleDelete = async (id) => {
    await base44.entities.ReportCollaborator.delete(id);
    setCollabs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRoleChange = (id, newRole) => {
    setCollabs((prev) => prev.map((c) => c.id === id ? { ...c, role: newRole } : c));
  };

  const handleChecklistUpdate = (updated) => {
    setCollabs((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!isPro) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-heading text-3xl font-bold">Pro Feature</h2>
        <p className="text-muted-foreground">The Collaboration Workspace is available on the Pro plan. Invite team members, manage permissions, and share release checklists.</p>
        <Button className="gap-2" onClick={() => window.location.href = "/pricing"}>
          <Crown className="h-4 w-4" /> Upgrade to Pro
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-1">Pro Feature</p>
          <h1 className="font-heading text-4xl font-bold">Collaboration Workspace</h1>
          <p className="text-muted-foreground mt-1">Invite team members to tracks, manage permissions, and track release checklists together.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Song sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide px-1">Your Tracks</p>
            {songs.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1">No analyzed tracks yet.</p>
            ) : (
              songs.map((s) => {
                const count = collabs.filter((c) => c.song_analysis_id === s.id).length;
                return (
                  <button key={s.id} onClick={() => setSelectedSong(s)}
                    className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                      selectedSong?.id === s.id
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/20 text-foreground"
                    }`}>
                    <div className="flex items-center gap-2">
                      <Music2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-sm font-medium truncate">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 ml-5">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{count} collaborator{count !== 1 ? "s" : ""}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Main panel */}
          <div className="lg:col-span-3 space-y-5">
            {!selectedSong ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-3">
                <Music2 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="font-heading font-semibold">Select a track to manage collaborators</p>
              </div>
            ) : (
              <>
                {/* Track header */}
                <div className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl">{selectedSong.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedSong.artist_name} · {selectedSong.genre}</p>
                    {myRole && (
                      <span className={`inline-flex mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        myRole === "admin" ? "bg-primary/10 text-primary" :
                        myRole === "editor" ? "bg-chart-5/10 text-chart-5" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {isOwner ? "Owner" : myRole}
                      </span>
                    )}
                  </div>
                  {isOwner && (
                    <Button className="gap-2 shrink-0" onClick={() => setShowInvite(true)}>
                      <UserPlus className="h-4 w-4" /> Invite
                    </Button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-secondary/30 border border-border rounded-xl p-1">
                  {[
                    { id: "members", label: "Members" },
                    { id: "checklist", label: "Release Checklist" },
                  ].map(({ id, label }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === id ? "bg-card border border-border text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {id === "members" ? <Users className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Members tab */}
                {activeTab === "members" && (
                  <motion.div key="members" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    {songCollabs.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3">
                        <Users className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm font-medium">No collaborators yet</p>
                        {isOwner && (
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowInvite(true)}>
                            <UserPlus className="h-4 w-4" /> Invite someone
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Owner row */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {(user?.full_name?.[0] || "O").toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{user?.full_name || "You"}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-primary/10 text-primary">Owner</span>
                        </div>

                        {songCollabs.map((c) => (
                          <CollabMemberRow key={c.id} collab={c} isOwner={isOwner}
                            onDelete={handleDelete} onRoleChange={handleRoleChange} />
                        ))}
                      </div>
                    )}

                    {/* Permission legend */}
                    <div className="rounded-xl bg-secondary/20 border border-border p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Permission Levels</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div><span className="font-bold">Viewer</span> — Read-only access to report & checklist</div>
                        <div><span className="font-bold">Editor</span> — Can update checklist & leave comments</div>
                        <div><span className="font-bold">Admin</span> — Full access, can invite other collaborators</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Checklist tab */}
                {activeTab === "checklist" && (
                  <motion.div key="checklist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-card border border-border p-6">
                    {songCollabs.length === 0 && isOwner ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Invite collaborators first to share and track the release checklist together.</p>
                        <Button size="sm" className="gap-2" onClick={() => setShowInvite(true)}>
                          <UserPlus className="h-4 w-4" /> Invite Collaborator
                        </Button>
                      </div>
                    ) : checklistCollab ? (
                      <CollabChecklist
                        collab={checklistCollab}
                        canEdit={canEdit}
                        onUpdate={handleChecklistUpdate}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Checklist will be visible once your invitation is accepted.
                      </p>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showInvite && selectedSong && (
        <InviteModal
          song={selectedSong}
          user={user}
          onClose={() => setShowInvite(false)}
          onInvited={async () => {
            const updated = await base44.entities.ReportCollaborator.list("-created_date", 100);
            setCollabs(updated);
          }}
        />
      )}
    </div>
  );
}