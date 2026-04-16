import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, ChevronDown } from "lucide-react";

const ROLE_COLORS = {
  viewer: "bg-secondary text-muted-foreground",
  editor: "bg-chart-5/10 text-chart-5",
  admin: "bg-primary/10 text-primary",
};

const STATUS_COLORS = {
  pending: "text-yellow-400",
  accepted: "text-primary",
  declined: "text-destructive",
};

export default function CollabMemberRow({ collab, isOwner, onDelete, onRoleChange }) {
  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (newRole) => {
    setUpdating(true);
    await base44.entities.ReportCollaborator.update(collab.id, { role: newRole });
    onRoleChange(collab.id, newRole);
    setUpdating(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/20 border border-border">
      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
        {(collab.collaborator_email[0] || "?").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{collab.collaborator_name || collab.collaborator_email}</p>
        <p className="text-xs text-muted-foreground truncate">{collab.collaborator_email}</p>
      </div>

      {/* Status */}
      <span className={`text-xs font-medium capitalize ${STATUS_COLORS[collab.status]}`}>
        {collab.status}
      </span>

      {/* Role selector */}
      {isOwner ? (
        <select
          value={collab.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={updating}
          className="h-7 rounded-lg border border-input bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      ) : (
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[collab.role]}`}>
          {collab.role}
        </span>
      )}

      {isOwner && (
        <button onClick={() => onDelete(collab.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}