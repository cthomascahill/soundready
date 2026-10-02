import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { RefreshCw } from "lucide-react";

const PLATFORM_LABELS = {
  spotify: "Spotify",
  youtube: "YouTube",
  instagram: "Instagram",
  soundcloud: "SoundCloud",
  tiktok: "TikTok",
  apple_music: "Apple Music",
};

// Compact badges showing how old each connected platform's stats are,
// so Maya's advice is always based on fresh numbers. Click to update.
export default function ConnectionFreshness() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.PlatformConnection.filter({ created_by_id: user.id }, "-last_synced", 10)
      .then(setConnections)
      .catch(() => setConnections([]));
  }, [user]);

  if (!connections) return null;
  const active = connections.filter((c) => c.status === "connected");
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((c) => {
        const days = c.last_synced
          ? Math.floor((Date.now() - new Date(c.last_synced).getTime()) / 86400000)
          : null;
        const stale = days === null || days >= 7;
        const label = days === null ? "never synced" : days === 0 ? "synced today" : `${days} day${days === 1 ? "" : "s"} old`;
        return (
          <button
            key={c.id}
            onClick={() => navigate("/connect-profiles")}
            title="Open Connect Platforms to update your stats"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
              stale
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/20"
                : "bg-primary/10 text-primary border-primary/25 hover:bg-primary/20"
            }`}
          >
            <RefreshCw className="h-3 w-3" />
            {(PLATFORM_LABELS[c.platform] || c.platform) + ": " + label}
            {stale && <span className="font-normal opacity-80">— update</span>}
          </button>
        );
      })}
    </div>
  );
}