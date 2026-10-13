import { useNavigate } from "react-router-dom";
import { LayoutGrid, Sparkles } from "lucide-react";

// The mode switch between the full workspace and the chat-first Ask Sam view.
export default function WorkspaceToggle({ mode }) {
  const navigate = useNavigate();
  const items = [
    { id: "workspace", label: "Workspace", icon: LayoutGrid, to: "/history" },
    { id: "chat", label: "Ask SAM", icon: Sparkles, to: "/ask-sam" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => mode !== it.id && navigate(it.to)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            mode === it.id
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <it.icon className="h-3.5 w-3.5" />
          {it.label}
        </button>
      ))}
    </div>
  );
}