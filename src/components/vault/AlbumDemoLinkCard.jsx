import { useState, useEffect } from "react";
import { Link2, Copy, Check, Loader2, Ban, ExternalLink, Disc3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

// "Album demo link" — a private listen link for an entire project. Anyone
// with the URL hears every song in the project, in order, no account needed.
export default function AlbumDemoLinkCard({ project, songs }) {
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const projectId = project?.id;

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    base44.functions.invoke("demoLink", { action: "get_by_song", project_id: projectId })
      .then((res) => setLink(res.data?.link || null))
      .catch(() => setLink(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  const create = async () => {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const res = await base44.functions.invoke("demoLink", { action: "create", project_id: projectId });
      setLink(res.data?.link || null);
    } catch (e) {
      setError(e?.response?.data?.error || "Couldn't create the link — try again.");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async () => {
    if (!link) return;
    await base44.functions.invoke("demoLink", { action: "revoke", link_id: link.id }).catch(() => {});
    setLink(null);
  };

  const copy = async () => {
    const url = `${window.location.origin}/demo/${link.token}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tracksWithAudio = (songs || []).filter(s => s.project_ids?.includes(projectId) && s.file_url);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-3 flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking album demo link…
      </div>
    );
  }

  if (tracksWithAudio.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-3 flex items-center gap-2 text-sm text-zinc-500">
        <Disc3 className="h-4 w-4 text-zinc-600" />
        Add audio files to songs in this project to share an album demo link.
      </div>
    );
  }

  if (!link) {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Disc3 className="h-4 w-4 text-primary" />
            Album demo link — all {tracksWithAudio.length} track{tracksWithAudio.length === 1 ? "" : "s"}, one link
          </div>
          <Button size="sm" onClick={create} disabled={creating} className="gap-2 font-semibold">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Create album link
          </Button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/demo/${link.token}`;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Disc3 className="h-4 w-4" /> Album demo link is live
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{link.plays || 0} play{(link.plays || 0) === 1 ? "" : "s"}</span>
          <Button size="sm" variant="outline" onClick={revoke}
            className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 h-7 px-2 text-xs">
            <Ban className="h-3 w-3" /> Turn off
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 min-w-0 truncate rounded-lg bg-muted border border-border px-3 py-2 text-xs text-foreground">
          {shareUrl}
        </code>
        <Button size="sm" onClick={copy} className="gap-1.5 shrink-0">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <a href={shareUrl} target="_blank" rel="noreferrer"
          className="h-8 w-8 rounded-md border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors shrink-0"
          title="Open the player">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <p className="text-[11px] text-zinc-600">Anyone with this link hears the whole project in order. Turn it off anytime and it stops working.</p>
    </div>
  );
}