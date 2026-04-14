import { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

const PITCH_TEMPLATES = {
  "Hip Hop": `Hi {booking_contact},

I'm {artist_name}, a rising hip-hop artist with {fan_overlap} overlapping fans with {tour_artist}. I've been building momentum with {listener_count} monthly listeners and would love to support {tour_artist}'s {tour_name} tour.

My sound complements {tour_artist}'s style, and I'm confident I can deliver an energetic opening set that connects with your audience.

Would you be open to discussing an opening slot? I've attached my EPK and some recent tracks.

Looking forward to hearing from you.

Best,
{artist_name}`,

  Pop: `Hello {booking_contact},

I'm {artist_name}, an emerging pop artist reaching {listener_count} monthly listeners. I'm genuinely excited about {tour_artist}'s upcoming tour and think my music would resonate with {tour_artist}'s fanbase.

With {fan_overlap} overlapping listeners, I believe I could deliver a memorable opening performance that sets the perfect tone for {tour_artist}'s show.

Would love to explore this opportunity further. Happy to share my latest releases and performance history.

Thanks,
{artist_name}`,

  Rock: `Hi {booking_contact},

I'm {artist_name}, a rock artist inspired by similar influences as {tour_artist}. With {listener_count} monthly listeners and {fan_overlap} fans who follow {tour_artist}, I'd be thrilled to open for {tour_name}.

I deliver high-energy live performances and think the audiences would appreciate my sound. I'm flexible with setlist length and happy to work around {tour_artist}'s production needs.

Would you have time to discuss opening slot possibilities?

Best regards,
{artist_name}`,

  default: `Hi {booking_contact},

I'm {artist_name}, an artist with {listener_count} monthly listeners, and I'd like to express interest in opening for {tour_artist}'s {tour_name} tour.

I've noticed {fan_overlap} audience overlap and believe my music would complement {tour_artist}'s show perfectly. I'm professional, reliable, and adaptable to your production requirements.

Would you be open to a conversation about this opportunity?

Looking forward to your response.

Best,
{artist_name}`,
};

export default function OpeningSlotPitchModal({ tour, artistData, onClose, onPitchCreated }) {
  const [step, setStep] = useState("customize"); // customize, preview, sent
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    artist_name: artistData?.name || "",
    booking_contact: tour.booking_contact || "Booking Agent",
    tour_artist: tour.artist_name || tour.name,
    tour_name: tour.tour_name || "tour",
    listener_count: artistData?.monthly_listeners || "emerging",
    fan_overlap: "significant",
    email_subject: `Opening Slot Request - ${artistData?.name || "Your Artist"}`,
    pitch_body: "",
  });

  const genre = artistData?.genre || "default";
  const template = PITCH_TEMPLATES[genre] || PITCH_TEMPLATES.default;

  const generatePitch = () => {
    let body = template;
    Object.entries(formData).forEach(([key, value]) => {
      body = body.replace(`{${key}}`, value);
    });
    setFormData((f) => ({ ...f, pitch_body: body }));
    setStep("preview");
  };

  const copyToClipboard = () => {
    const fullEmail = `Subject: ${formData.email_subject}\n\n${formData.pitch_body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendPitch = async () => {
    if (!formData.pitch_body.trim()) return;
    setLoading(true);

    try {
      await onPitchCreated({
        tour_artist: formData.tour_artist,
        tour_name: formData.tour_name,
        booking_contact: formData.booking_contact,
        email_subject: formData.email_subject,
        pitch_body: formData.pitch_body,
        status: "sent",
        created_date: new Date().toISOString().split("T")[0],
      });
      setStep("sent");
    } catch (error) {
      console.error("Error creating pitch:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold text-lg">
            {step === "customize"
              ? "Customize Your Pitch"
              : step === "preview"
              ? "Review & Send"
              : "Pitch Sent!"}
          </p>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "customize" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Booking Contact Name</label>
              <Input
                value={formData.booking_contact}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, booking_contact: e.target.value }))
                }
                placeholder="e.g. John Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Monthly Listeners</label>
                <Input
                  value={formData.listener_count}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, listener_count: e.target.value }))
                  }
                  placeholder="e.g. 50,000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Fan Overlap %</label>
                <Input
                  value={formData.fan_overlap}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, fan_overlap: e.target.value }))
                  }
                  placeholder="e.g. 15% or 'significant'"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Email Subject</label>
              <Input
                value={formData.email_subject}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, email_subject: e.target.value }))
                }
                placeholder="Opening Slot Request"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={generatePitch} className="flex-1">
                Generate Pitch
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-secondary/30 border border-border p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                <p className="font-medium text-sm">{formData.email_subject}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Email Body:</p>
                <p className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {formData.pitch_body}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={sendPitch} disabled={loading} className="flex-1 gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? "Creating..." : "Create Pitch Record"}
              </Button>
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep("customize")}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {step === "sent" && (
          <div className="space-y-4 py-6 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-heading font-bold text-lg">Pitch recorded!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your opening slot pitch for {formData.tour_artist} has been saved and is ready to send manually or track.
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 text-left text-xs space-y-1">
              <p className="font-medium">Next steps:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                <li>Copy the pitch and send via email</li>
                <li>Track responses in your Pitches dashboard</li>
                <li>Follow up in 1-2 weeks if no response</li>
              </ul>
            </div>
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}