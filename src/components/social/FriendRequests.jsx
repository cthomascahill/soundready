import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, UserCheck, X, Clock } from "lucide-react";

/**
 * Requests tab of the Friends page — incoming requests to accept or
 * decline (friend requests are always approved manually), and outgoing
 * requests you can cancel.
 */
export default function FriendRequests({ user, requests, onUpdated, onRemoved }) {
  const [busyId, setBusyId] = useState(null);

  const incoming = requests.filter((r) => r.recipient_id === user.id && r.status === "pending");
  const outgoing = requests.filter((r) => r.requester_id === user.id && r.status === "pending");

  const respond = async (req, status) => {
    if (busyId) return;
    setBusyId(req.id);
    try {
      onUpdated(await base44.entities.FriendRequest.update(req.id, { status }));
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (req) => {
    if (busyId) return;
    if (!window.confirm(`Cancel your friend request to ${req.recipient_name || "this creator"}?`)) return;
    setBusyId(req.id);
    try {
      await base44.entities.FriendRequest.delete(req.id);
      onRemoved(req.id);
    } finally {
      setBusyId(null);
    }
  };

  const Row = ({ req, actions }) => (
    <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border p-3">
      <div className="h-9 w-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm shrink-0">
        {(req.requester_name || req.recipient_name || "?").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{req.requester_name || req.recipient_name}</p>
        <p className="text-[11px] text-muted-foreground">{actions.hint}</p>
      </div>
      {actions.node}
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <p className="font-heading font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" /> Incoming
        </p>
        {incoming.length === 0 ? (
          <p className="text-xs text-muted-foreground/70 py-6 text-center">No pending requests.</p>
        ) : (
          incoming.map((req) => (
            <Row
              key={req.id}
              req={req}
              actions={{
                hint: "wants to be friends",
                node: (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => respond(req, "accepted")}
                      disabled={busyId === req.id}
                      className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold disabled:opacity-50 flex items-center gap-1"
                    >
                      <UserCheck className="h-3 w-3" /> Accept
                    </button>
                    <button
                      onClick={() => respond(req, "declined")}
                      disabled={busyId === req.id}
                      className="px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground text-[11px] flex items-center gap-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" /> Decline
                    </button>
                  </div>
                ),
              }}
            />
          ))
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <p className="font-heading font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Sent by You
        </p>
        {outgoing.length === 0 ? (
          <p className="text-xs text-muted-foreground/70 py-6 text-center">No outgoing requests.</p>
        ) : (
          outgoing.map((req) => (
            <Row
              key={req.id}
              req={req}
              actions={{
                hint: "waiting for them to accept",
                node: (
                  <button
                    onClick={() => cancel(req)}
                    disabled={busyId === req.id}
                    className="px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground text-[11px] hover:text-destructive shrink-0"
                  >
                    Cancel
                  </button>
                ),
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}