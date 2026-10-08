import { Link } from "react-router-dom";
import { X, Mail, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pulls the sent email's proof fields out of any outreach record type
function extract(doc) {
  const r = doc.record || {};
  if (doc.kind === "draft") return { body: r.draft, to: r.target_email, sentAt: r.sent_at, target: r.target_name, sourceUrl: r.source_url };
  if (doc.kind === "deal") return { body: r.draft, to: r.contact_email, sentAt: r.sent_at, target: r.company_name, sourceUrl: r.source_url || r.submission_url };
  if (doc.kind === "rec") return { body: r.draft, to: r.recipient_email, sentAt: r.executed_at, target: r.title };
  return { body: r.draft_email, to: r.recipient_email, sentAt: r.sent_at, target: r.title, sourceUrl: r.source_url };
}

/**
 * Proof that Sam's outreach actually went out: who it went to, when,
 * from where, and the exact email that was sent.
 */
export default function SentEmailDialog({ doc, onClose }) {
  if (!doc) return null;
  const { body, to, sentAt, target, sourceUrl } = extract(doc);
  const when = sentAt || doc.date ? new Date(sentAt || doc.date) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <p className="font-heading font-bold text-sm truncate pr-4">{doc.title}</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Proof of send */}
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              Sent by Sam from your SoundReady account
            </p>
            <div className="grid gap-1.5 text-xs text-muted-foreground">
              {when && (
                <p>
                  <span className="text-foreground/70 font-medium">When:</span>{" "}
                  {when.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              )}
              <p className="flex items-center gap-1.5 min-w-0">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-foreground/70 font-medium">To:</span>{" "}
                <span className="truncate">{to || (target ? `${target}'s contact on file` : "the contact on file")}</span>
              </p>
              {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline w-fit">
                  <ExternalLink className="h-3 w-3" /> Contact source Sam verified
                </a>
              )}
            </div>
          </div>

          {/* The exact email */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block">The email that was sent</label>
            <div className="rounded-xl border border-border bg-secondary/40 p-4 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {body || "No email text was saved for this item."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <Link to={doc.link}>
            <Button variant="outline">Open in {doc.sourceLabel}</Button>
          </Link>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}