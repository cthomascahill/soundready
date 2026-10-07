import { Eye } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { rawTier } from "@/lib/tier";

export const PREVIEW_KEY = "sr_preview_tier";

const OPTIONS = [
  { id: null, label: "AI" },
  { id: "pro", label: "Pro" },
  { id: "free", label: "Free" },
];

// View-as preview: shown only to accounts that really have AI Manager access,
// so they can see exactly what Free and Artist Pro artists see.
export default function PreviewTierSwitcher() {
  const { user } = useAuth();
  if (rawTier(user) !== "ai_manager") return null;

  const current = sessionStorage.getItem(PREVIEW_KEY) || null;

  const setTier = (id) => {
    if (id) sessionStorage.setItem(PREVIEW_KEY, id);
    else sessionStorage.removeItem(PREVIEW_KEY);
    window.location.reload();
  };

  return (
    <div className="px-3 py-2">
      <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        <Eye className="h-3 w-3" /> View as
      </p>
      <div className="flex gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setTier(opt.id)}
            className={`flex-1 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              current === opt.id
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}