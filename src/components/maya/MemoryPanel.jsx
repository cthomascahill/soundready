import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

const CATEGORIES = {
  goals: "Goals",
  preferences: "Preferences",
  constraints: "Constraints",
  decisions: "Decisions",
  projects: "Projects",
  outreach_style: "Outreach Style",
};

function MemoryRow({ memory, onUpdated, onRemoved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(memory.value);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const updated = await base44.entities.MayaMemory.update(memory.id, { value: value.trim() || memory.value });
    setBusy(false);
    setEditing(false);
    onUpdated(updated);
  };

  const setStatus = async (status) => {
    setBusy(true);
    const updated = await base44.entities.MayaMemory.update(memory.id, { status });
    setBusy(false);
    onUpdated(updated);
  };

  const remove = async () => {
    setBusy(true);
    await base44.entities.MayaMemory.delete(memory.id);
    onRemoved(memory.id);
  };

  const isProposed = memory.status === "proposed";

  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 transition-colors ${
      isProposed ? "border-primary/25 bg-primary/5" : "border-border bg-secondary/30"
    }`}>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs font-semibold">{memory.key}</p>
        {editing ? (
          <div className="flex gap-2">
            <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-7 text-xs" autoFocus />
            <Button size="sm" className="h-7 px-2.5" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">{memory.value}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
      {isProposed ? (
        <>
          <Button size="sm" className="h-7 px-2.5 gap-1" onClick={() => setStatus("confirmed")} disabled={busy}>
            <Check className="h-3 w-3" /> Keep
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-muted-foreground gap-1" onClick={() => setStatus("dismissed")} disabled={busy}>
            <X className="h-3 w-3" /> Not right
          </Button>
        </>
      ) : (
        <>
          <button
            onClick={() => { if (editing) { save(); } else { setValue(memory.value); setEditing(true); } }}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-primary transition-colors"
            title={editing ? "Save" : "Edit"}
          >
            {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </button>
            <button
              onClick={remove}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-destructive transition-colors"
              title="Forget this"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * "What Sam knows" — every durable preference they've confirmed from chat.
 * Artists can correct, edit, or make Sam forget any of it.
 */
export default function MemoryPanel() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    base44.entities.MayaMemory.filter({ user_id: user.id }, "-created_date", 200)
      .then(setMemories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const onUpdated = (updated) => setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  const onRemoved = (id) => setMemories((prev) => prev.filter((m) => m.id !== id));

  const proposed = memories.filter((m) => m.status === "proposed");
  const confirmed = memories.filter((m) => m.status === "confirmed");

  const grouped = Object.keys(CATEGORIES)
    .map((cat) => ({ cat, items: confirmed.filter((m) => m.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          These are the durable things you've told Sam in conversation — goals, preferences, constraints, decisions, project details, and how you like outreach handled.
          She applies them everywhere she works for you: chat, recommendations, and drafts. Anything that's off, correct or delete — she won't take it personally.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-card border border-border animate-pulse" />)}
        </div>
      ) : (
        <>
          {proposed.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Waiting on you</p>
              {proposed.map((m) => <MemoryRow key={m.id} memory={m} onUpdated={onUpdated} onRemoved={onRemoved} />)}
            </div>
          )}

          {grouped.length === 0 && proposed.length === 0 ? (
            <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center space-y-3">
              <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="font-semibold">Sam hasn't learned anything yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Tell Sam about your goals, what you will and won't do, and how you like to be pitched — chat with Sam and they'll remember it here.
              </p>
            </div>
          ) : (
            grouped.map(({ cat, items }) => (
              <div key={cat} className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{CATEGORIES[cat]}</p>
                {items.map((m) => <MemoryRow key={m.id} memory={m} onUpdated={onUpdated} onRemoved={onRemoved} />)}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}