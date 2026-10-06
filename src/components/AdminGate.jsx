import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

/**
 * Wraps a page so only the owner's account can reach it.
 * Everyone else sees a simple not-authorized screen instead of the page content.
 */
const OWNER_EMAIL = "mgmt@mattcorman.com";

export default function AdminGate({ children }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.email === OWNER_EMAIL || user?.role === "admin") return children;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 space-y-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-5 w-5 text-destructive" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-bold">Restricted area</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You don't have access to this area of SoundReady.
          </p>
        </div>
        <Link to="/dashboard" className="text-xs text-primary underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}