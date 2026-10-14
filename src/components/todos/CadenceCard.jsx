import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Mail, Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "daily", label: "Daily", hint: "Every morning" },
  { value: "every_3_days", label: "Every 3 days", hint: "A little breathing room" },
  { value: "weekly", label: "Sundays", hint: "One email a week" },
  { value: "monthly", label: "Monthly", hint: "First of each month" },
];

/**
 * Lets the artist pick how often Sam emails their open to-do list.
 * Saved choice is respected by the morning reminder routine.
 */
export default function CadenceCard() {
  const { user } = useAuth();
  const [cadence, setCadence] = useState(null); // null = still loading
  const [prefId, setPrefId] = useState(undefined); // undefined = unknown, null = none yet
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.TodoEmailPreference.filter({ user_id: user.id })
      .then(({ items }) => {
        if (items.length > 0) {
          setPrefId(items[0].id);
          setCadence(items[0].cadence || "daily");
        } else {
          setPrefId(null);
          setCadence("daily");
        }
      })
      .catch(() => {
        setPrefId(null);
        setCadence("daily");
      });
  }, [user?.id]);

  const choose = async (value) => {
    if (saving || value === cadence || prefId === undefined) return;
    const prev = cadence;
    setCadence(value);
    setSaving(true);
    setError(false);
    try {
      if (prefId) {
        await base44.entities.TodoEmailPreference.update(prefId, { cadence: value });
      } else {
        const rec = await base44.entities.TodoEmailPreference.create({ user_id: user.id, cadence: value });
        setPrefId(rec.id);
      }
    } catch {
      setCadence(prev);
      setError(true);
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <p className="font-heading font-bold">How often should Sam email your list?</p>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            disabled={saving || cadence === null}
            className={`rounded-xl border p-3 text-left transition-colors ${
              cadence === opt.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40"
            }`}
          >
            <p className="text-sm font-bold">{opt.label}</p>
            <p className="text-[11px] text-muted-foreground">{opt.hint}</p>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {error
          ? "Couldn't save that, try again."
          : cadence === "daily"
            ? "Sam sends your open to-dos every morning at 8am ET."
            : cadence === "weekly"
              ? "Sam sends your open to-dos every Sunday morning."
              : cadence === "monthly"
                ? "Sam sends your open to-dos on the 1st of each month."
                : "Sam sends your open to-dos once every three days."}
      </p>
    </div>
  );
}