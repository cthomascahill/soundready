import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, HelpCircle, Loader2, CheckCircle2, Building2 } from "lucide-react";

// Lets the artist rate Sam's work (useful / off target / missing info) and,
// for venue targets, correct or add the venue — corrections land in the
// shared venue directory and feedback feeds Sam's next task.
export default function FeedbackControl({ taskId, draftId = null, targetName = "" }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [fixVenue, setFixVenue] = useState(false);
  const [venueName, setVenueName] = useState(targetName);
  const [venueCity, setVenueCity] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");
  const [venueContact, setVenueContact] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const send = async (r) => {
    if (!user?.id || sending) return;
    setSending(true);
    try {
      await base44.entities.SamFeedback.create({
        user_id: user.id,
        task_id: taskId,
        draft_id: draftId || "",
        feedback_on: draftId ? "draft" : "task_result",
        rating: r,
        comment: comment.trim(),
        venue_name: fixVenue ? venueName.trim() : targetName,
      });

      // Artist-corrected venue → shared directory, verified by the artist
      if (fixVenue && venueName.trim() && venueCity.trim()) {
        const existing = await base44.entities.VenueRecord.filter({ venue_name: venueName.trim() }).catch(() => []);
        const match = existing.find(v => (v.city || "").toLowerCase() === venueCity.trim().toLowerCase());
        const contact = venueContact.trim();
        const payload = {
          venue_name: venueName.trim(),
          city: venueCity.trim(),
          verified: true,
          verified_by: "artist",
          ...(venueCapacity.trim() ? { capacity: Number(venueCapacity) || null } : {}),
          ...(contact.includes("@") ? { contact_email: contact } : contact ? { submission_page: contact } : {}),
        };
        if (match) await base44.entities.VenueRecord.update(match.id, payload);
        else await base44.entities.VenueRecord.create(payload);
      }
      setDone(true);
      toast({ description: "Thanks — Sam will factor that into future work." });
    } catch (err) {
      toast({ description: err.message || "Couldn't save feedback — try again." });
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-primary/90">
        <CheckCircle2 className="h-3.5 w-3.5" /> Saved — Sam learns from this on the next task.
      </p>
    );
  }

  const ratingBtn = (r, icon, label) => (
    <button
      onClick={() => {
        setRating(r);
        if (r === "useful") send("useful");
      }}
      disabled={sending}
      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
        rating === r ? "border-primary/40 text-primary bg-primary/10"
          : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="space-y-2.5 pt-2 border-t border-border/60">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground/70">How did Sam do?</span>
        {ratingBtn("useful", <ThumbsUp className="h-3 w-3" />, "Good find")}
        {ratingBtn("incorrect", <ThumbsDown className="h-3 w-3" />, "Off target")}
        {ratingBtn("missing_detail", <HelpCircle className="h-3 w-3" />, "Missing info")}
      </div>

      {rating && rating !== "useful" && (
        <div className="space-y-2.5 rounded-xl bg-secondary/30 border border-border/70 p-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="What was wrong or missing? (optional)"
            className="text-xs bg-background/60"
          />
          <button onClick={() => setFixVenue(!fixVenue)}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors">
            <Building2 className="h-3.5 w-3.5" />
            {fixVenue ? "— Skip venue correction" : "+ Add or correct a venue (helps Sam everywhere)"}
          </button>
          {fixVenue && (
            <div className="grid grid-cols-2 gap-2">
              <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Venue name" className="text-xs h-8" />
              <Input value={venueCity} onChange={(e) => setVenueCity(e.target.value)} placeholder="City, ST" className="text-xs h-8" />
              <Input value={venueCapacity} onChange={(e) => setVenueCapacity(e.target.value)} placeholder="Capacity (optional)" className="text-xs h-8" />
              <Input value={venueContact} onChange={(e) => setVenueContact(e.target.value)} placeholder="Booking email or page (optional)" className="text-xs h-8" />
            </div>
          )}
          <Button size="sm" disabled={sending} onClick={() => send(rating)} className="gap-1.5 text-xs h-8">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Send feedback
          </Button>
        </div>
      )}
    </div>
  );
}