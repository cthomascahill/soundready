import { useState, useEffect } from "react";
import { MessageCircle, Send, CheckCircle2, Circle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReportCard, { CardHeader } from "../report/ReportCard";

const SECTIONS = [
  "Algorithm Outlook", "Best Clip Moments", "Content Video Ideas",
  "Release Recommendations", "Playlist Pitch", "Social Captions",
  "Social Assets", "Checklist", "TikTok Scripts", "Visual Identity",
  "Money Moves", "General",
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CommentItem({ comment, onResolve }) {
  return (
    <div className={`p-3 rounded-xl border space-y-1.5 transition-opacity ${comment.resolved ? "opacity-50 bg-secondary/10 border-border/50" : "bg-secondary/20 border-border"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
            {(comment.author_name || comment.author_email || "?")[0].toUpperCase()}
          </div>
          <span className="text-xs font-medium">{comment.author_name || comment.author_email}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(comment.created_date)}</span>
          {comment.section && comment.section !== "General" && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">{comment.section}</span>
          )}
        </div>
        <button onClick={() => onResolve(comment)}
          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
          title={comment.resolved ? "Mark unresolved" : "Mark resolved"}>
          {comment.resolved
            ? <CheckCircle2 className="h-4 w-4 text-primary" />
            : <Circle className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed pl-8">{comment.body}</p>
    </div>
  );
}

export default function CommentThread({ songAnalysisId, songTitle, currentUser }) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [section, setSection] = useState("General");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    if (!songAnalysisId) { setLoading(false); return; }
    base44.entities.ReportComment.filter({ song_analysis_id: songAnalysisId }, "-created_date")
      .then(setComments).finally(() => setLoading(false));
  }, [songAnalysisId]);

  const submit = async () => {
    if (!body.trim() || !songAnalysisId) return;
    setSubmitting(true);
    const comment = await base44.entities.ReportComment.create({
      song_analysis_id: songAnalysisId,
      song_title: songTitle,
      author_email: currentUser?.email || "anonymous",
      author_name: currentUser?.full_name || currentUser?.email || "Anonymous",
      section,
      body: body.trim(),
      resolved: false,
    });
    setComments((prev) => [comment, ...prev]);
    setBody("");
    setSubmitting(false);
  };

  const toggleResolve = async (comment) => {
    const updated = await base44.entities.ReportComment.update(comment.id, { resolved: !comment.resolved });
    setComments((prev) => prev.map((c) => c.id === comment.id ? { ...c, resolved: !c.resolved } : c));
  };

  const active = comments.filter((c) => !c.resolved);
  const resolved = comments.filter((c) => c.resolved);
  const displayed = showResolved ? comments : active;

  if (!songAnalysisId) {
    return (
      <ReportCard borderColor="border-l-chart-3">
        <CardHeader icon={MessageCircle} title="Comments" iconColor="text-chart-3" badge="Collab" />
        <div className="rounded-xl bg-secondary/30 border border-border p-5 text-center">
          <p className="text-sm text-muted-foreground">Save this report to leave comments.</p>
        </div>
      </ReportCard>
    );
  }

  return (
    <ReportCard borderColor="border-l-chart-3">
      <CardHeader icon={MessageCircle} title="Comments & Feedback" iconColor="text-chart-3" badge="Collab" />

      {/* Compose */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring shrink-0"
          >
            {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder="Leave feedback, notes, or ideas... (⌘+Enter to submit)"
            rows={2}
            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <button onClick={submit} disabled={submitting || !body.trim()}
            className="h-auto px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors self-stretch flex items-center">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="py-4 flex justify-center">
          <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.length === 0 ? (
            <div className="rounded-xl bg-secondary/20 border border-dashed border-border p-5 text-center">
              <MessageCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
            </div>
          ) : (
            displayed.map((c) => <CommentItem key={c.id} comment={c} onResolve={toggleResolve} />)
          )}
          {resolved.length > 0 && (
            <button onClick={() => setShowResolved((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
              {showResolved ? "Hide" : `Show ${resolved.length} resolved`}
            </button>
          )}
        </div>
      )}
    </ReportCard>
  );
}