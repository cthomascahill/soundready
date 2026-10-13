import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Loader2, X } from "lucide-react";
import ProGate from "@/components/ProGate";
import AiManagerGate from "@/components/AiManagerGate";

// A tool Sam pulled up, opened right inside the chat. Plan limits apply the
// same as the full pages: gated tools show their upgrade screen.
export default function ToolPanel({ tool, onClose }) {
  const navigate = useNavigate();

  if (!tool.component) {
    return (
      <button
        onClick={() => navigate(tool.path)}
        className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
      >
        <tool.icon className="h-4 w-4 shrink-0" />
        Open {tool.name}
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    );
  }

  const Gate = tool.tier === "ai" ? AiManagerGate : tool.tier === "pro" ? ProGate : null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border bg-muted/60">
        <tool.icon className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm font-semibold flex-1 truncate">{tool.name}</p>
        <button
          onClick={() => navigate(tool.path)}
          title="Open full view"
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onClose}
          title="Close"
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        <Suspense
          fallback={
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          }
        >
          {Gate ? <Gate><tool.component /></Gate> : <tool.component />}
        </Suspense>
      </div>
    </div>
  );
}