import { Mail, MapPin, Users, Pencil, X, Send, ShieldCheck } from "lucide-react";

// A static, product-accurate mock of the draft approval card (step 3 of the walkthrough)
export default function StepApproveScreen() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-left pointer-events-none select-none shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">The Marquee Room</p>
          <p className="text-xs text-muted-foreground leading-relaxed">Matches your sound and draws the crowd you're building in Denver.</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
          Needs review
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Mail className="h-3 w-3 text-primary" /> bookings@marqueeroom.com
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/60 border border-border rounded-full px-2 py-0.5">
          <MapPin className="h-3 w-3 text-primary" /> Denver, CO
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/60 border border-border rounded-full px-2 py-0.5">
          <Users className="h-3 w-3 text-primary" /> ~250 cap
        </span>
      </div>
      <p className="text-[11px] text-yellow-500/90 leading-relaxed bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-2.5 py-1.5">
        Quality check: Booking email pulled straight from their own website. Under your 300-cap limit.
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed border border-border/60 bg-secondary/30 rounded-lg p-3">
        <span className="font-semibold text-foreground">Subject:</span> Indie artist playing The Marquee Room this spring
        <br />
        Hi — I'm an indie artist out of Denver. Your room has been on my list since the last show I caught there…
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md px-3 py-1.5">
          <Send className="h-3.5 w-3.5" /> Approve & Send
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium border border-input rounded-md px-3 py-1.5">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground rounded-md px-3 py-1.5">
          <X className="h-3.5 w-3.5" /> Deny
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Nothing sends without your approval
      </p>
    </div>
  );
}