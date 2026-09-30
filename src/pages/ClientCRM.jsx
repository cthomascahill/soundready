import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import NewClientForm from "@/components/clientcrm/NewClientForm";
import ClientCard from "@/components/clientcrm/ClientCard";
import { Users, Plus, Loader2 } from "lucide-react";

const STAGES = [
  { key: "Prospect", hint: "Artists you want to work with" },
  { key: "Pitched", hint: "Beats or collabs pitched" },
  { key: "Negotiating", hint: "Talking terms" },
  { key: "Closed", hint: "Deals done" },
];

/**
 * Client CRM — the producer's client pipeline: artists they've worked with,
 * pitched, or are closing, moving through deal stages.
 */
export default function ClientCRM() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ProducerClient.filter({ created_by_id: user.id }, "-created_date", 200)
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [user]);

  const onUpdated = (updated) =>
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  const onRemoved = (id) => setClients((prev) => prev.filter((c) => c.id !== id));
  const onSaved = (client) => setClients((prev) => [client, ...prev]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Client CRM
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Every artist relationship in one pipeline — pitches out, terms being negotiated, deals closed.
            </p>
          </div>
          <Button className="gap-2 font-semibold" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> New Client
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-heading font-bold text-lg">Your pipeline is empty</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Add artists you've pitched or worked with — or find new ones in Artist Match and Maya's scouting.
            </p>
            <Button size="sm" className="gap-2 mx-auto" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" /> Add Your First Client
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES.map((stage) => {
              const inStage = clients.filter((c) => (c.stage || "Prospect") === stage.key);
              return (
                <div key={stage.key} className="rounded-2xl bg-secondary/30 border border-border p-3 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="font-heading font-bold text-sm">{stage.key}</p>
                      <p className="text-[10px] text-muted-foreground">{stage.hint}</p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-secondary border border-border rounded-full px-2 py-0.5">
                      {inStage.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {inStage.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground/60 text-center py-4">No one here yet</p>
                    ) : (
                      inStage.map((c) => (
                        <ClientCard key={c.id} client={c} onUpdated={onUpdated} onRemoved={onRemoved} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewClientForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={onSaved} />
    </div>
  );
}