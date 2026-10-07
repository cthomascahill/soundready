import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getTier } from "@/lib/tier";
import { Button } from "@/components/ui/button";
import { Download, Save, CheckCircle2, Pencil } from "lucide-react";
import EpkForm from "@/components/epk/EpkForm";
import EpkPreview, { fmtNumber } from "@/components/epk/EpkPreview";
import EpkUpsellCard from "@/components/epk/EpkUpsellCard";
import { motion } from "framer-motion";

const EMPTY_FORM = {
  artist_name: "",
  bio: "",
  location: "",
  genre: "",
  music_url: "",
  contact_email: "",
  monthly_listeners: "",
  total_streams: "",
  followers: "",
  social_proof: [],
};

/**
 * Electronic Press Kit Generator: the artist's bio, real numbers, social
 * proof and music in one polished kit, saved to Storage as a PDF so Sam
 * can attach it to outbound pitches.
 */
export default function PitchDeck() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [epk, setEpk] = useState(null);

  // Prefill from the artist's own data: saved kit, profile, connected platforms
  useEffect(() => {
    if (!user?.id) return;
    const byMe = { created_by_id: user.id };
    Promise.all([
      base44.entities.SongVault.list("-created_date", 12).catch(() => []),
      base44.entities.EPK.filter(byMe, "-created_date", 1).catch(() => []),
      base44.entities.PlatformConnection.filter({ platform: "spotify", status: "connected" }, "-created_date", 1).catch(() => []),
      base44.entities.PlatformConnection.filter({ platform: "instagram", status: "connected" }, "-created_date", 1).catch(() => []),
    ]).then(([vault, epks, spotify, instagram]) => {
      setSongs(vault);
      const prev = epks[0];
      setForm((f) => ({
        ...f,
        artist_name: prev?.artist_name || user.artist_name || user.full_name || "",
        bio: prev?.bio || user.bio || "",
        location: prev?.location || "",
        genre: prev?.genre || "",
        music_url: prev?.music_url || "",
        contact_email: prev?.contact_email || user.email || "",
        monthly_listeners: prev?.monthly_listeners ?? spotify[0]?.stats?.monthly_listeners ?? "",
        total_streams: prev?.total_streams ?? "",
        followers: prev?.followers ?? instagram[0]?.stats?.followers ?? "",
        social_proof: prev?.social_proof || [],
      }));
      if (prev?.featured_songs) {
        setSelectedSongs(prev.featured_songs.map((s) => s.song_id).filter(Boolean));
      }
      setLoading(false);
    });
  }, [user]);

  const toggleSong = (id) =>
    setSelectedSongs((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const generate = async () => {
    setGenerating(true);
    setError("");
    setSaved(false);
    const featured = songs.filter((s) => selectedSongs.includes(s.id));
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are writing an Electronic Press Kit (EPK) for an independent artist. An EPK tells industry readers exactly who the artist is and what they do. It is not asking for anything and it is not a pitch deck.

Artist: ${form.artist_name}
Genre: ${form.genre || "not specified"}
Location: ${form.location || "not specified"}
Bio notes: ${form.bio || "none provided"}
Monthly listeners: ${form.monthly_listeners || "not reported"}
Total streams: ${form.total_streams || "not reported"}
Social followers: ${form.followers || "not reported"}
Social proof: ${JSON.stringify(form.social_proof.filter(p => p.text?.trim()))}
Featured songs: ${featured.map((s) => `${s.title}${s.genre ? ` (${s.genre})` : ""}`).join("; ") || "none"}

Write:
tagline: a hook line under the artist name, max 8 words, no ending period
one_liner: one sentence saying exactly who this artist is and what they do
bio: a polished press-ready bio in 2 short paragraphs, third person, grounded only in the details above. Never invent awards, numbers, press quotes or placements that were not provided.`,
        response_json_schema: {
          type: "object",
          properties: {
            tagline: { type: "string" },
            one_liner: { type: "string" },
            bio: { type: "string" },
          },
        },
      });
      setEpk({ copy: res, featured });
    } catch (e) {
      setError("Couldn't write the kit. Try again in a moment.");
    }
    setGenerating(false);
  };

  const buildPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const H = 297;
    const GREEN = [33, 196, 93];
    const DARK = [10, 13, 11];
    const GRAY = [140, 145, 140];
    const WHITE = [245, 245, 245];
    const F = "helvetica";

    // Header band
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 66, "F");
    doc.setFillColor(...GREEN);
    doc.rect(0, 0, 3.5, 66, "F");
    doc.setFont(F, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text("ELECTRONIC PRESS KIT", 12, 16);
    doc.setFontSize(26);
    doc.setTextColor(...WHITE);
    const nameLines = doc.splitTextToSize(form.artist_name || "Artist", W - 24);
    doc.text(nameLines, 12, 30);
    let hy = 30 + (nameLines.length - 1) * 10;
    if (epk.copy.tagline) {
      doc.setFontSize(12);
      doc.setTextColor(...GREEN);
      doc.text(doc.splitTextToSize(epk.copy.tagline, W - 24), 12, hy + 8);
      hy += 8;
    }
    const where = [form.location, form.genre].filter(Boolean).join(" · ");
    if (where) {
      doc.setFont(F, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text(where, 12, hy + 16);
    }

    let y = 78;
    const label = (t) => {
      doc.setFont(F, "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...GREEN);
      doc.text(t.toUpperCase(), 12, y);
      y += 7;
    };
    const para = (t, size = 9.5, color = WHITE, bold = false) => {
      doc.setFont(F, bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(t || "", W - 24);
      doc.text(lines, 12, y);
      y += lines.length * (size * 0.42) + 2;
    };

    // About
    label("About");
    para(epk.copy.one_liner, 11, WHITE, true);
    y += 1;
    (epk.copy.bio || "").split(/\n{2,}/).filter(Boolean).forEach((p) => para(p));
    y += 4;

    // The numbers
    const stats = [
      { label: "MONTHLY LISTENERS", value: form.monthly_listeners },
      { label: "TOTAL STREAMS", value: form.total_streams },
      { label: "SOCIAL FOLLOWERS", value: form.followers },
    ].filter((s) => Number(s.value) > 0);
    if (stats.length) {
      label("The Numbers");
      const boxW = (W - 24 - (stats.length - 1) * 4) / stats.length;
      stats.forEach((s, i) => {
        const x = 12 + i * (boxW + 4);
        doc.setFillColor(20, 24, 21);
        doc.roundedRect(x, y, boxW, 22, 2.5, 2.5, "F");
        doc.setFont(F, "bold");
        doc.setFontSize(15);
        doc.setTextColor(...GREEN);
        doc.text(fmtNumber(s.value), x + 5, y + 10);
        doc.setFont(F, "normal");
        doc.setFontSize(7);
        doc.setTextColor(...GRAY);
        doc.text(s.label, x + 5, y + 17);
      });
      y += 30;
    }

    // Featured songs
    if (epk.featured.length) {
      label("Featured Songs");
      epk.featured.slice(0, 6).forEach((s) => {
        doc.setFillColor(18, 22, 19);
        doc.roundedRect(12, y, W - 24, 12, 1.5, 1.5, "F");
        doc.setFont(F, "bold");
        doc.setFontSize(10);
        doc.setTextColor(...WHITE);
        doc.text((s.title || "").slice(0, 40), 18, y + 7.5);
        if (s.genre) {
          doc.setFont(F, "normal");
          doc.setFontSize(8);
          doc.setTextColor(...GRAY);
          doc.text(s.genre.slice(0, 30), W - 18, y + 7.5, { align: "right" });
        }
        y += 15;
      });
      y += 3;
    }

    // Social proof
    const proof = (form.social_proof || []).filter((p) => p.text?.trim());
    if (proof.length) {
      label("Social Proof");
      proof.slice(0, 5).forEach((p) => {
        para(`"${p.text.trim()}"`, 9.5, WHITE);
        if (p.source) para(`- ${p.source}`, 8, GRAY);
        y += 1.5;
      });
    }

    // Footer band
    doc.setFillColor(...DARK);
    doc.rect(0, H - 22, W, 22, "F");
    doc.setFillColor(...GREEN);
    doc.rect(0, H - 22, W, 1.5, "F");
    doc.setFontSize(8.5);
    doc.setTextColor(...GREEN);
    doc.setFont(F, "bold");
    if (form.music_url) doc.text("Listen: " + form.music_url.slice(0, 80), 12, H - 13);
    doc.setFont(F, "normal");
    doc.setTextColor(...GRAY);
    if (form.contact_email) doc.text(form.contact_email, 12, H - 6);
    doc.text("Built with SoundReady", W - 12, H - 13, { align: "right" });

    return doc;
  };

  const fileName = () =>
    `${(form.artist_name || "Artist").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Artist"}_EPK.pdf`;

  const download = async () => {
    const doc = await buildPdf();
    doc.save(fileName());
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const doc = await buildPdf();
      const blob = doc.output("blob");
      const file = new File([blob], fileName(), { type: "application/pdf" });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      // Older kits step aside; the newest one is what Sam attaches
      await base44.entities.EPK.updateMany(
        { created_by_id: user.id, active: true },
        { $set: { active: false } }
      );
      await base44.entities.EPK.create({
        user_id: user.id,
        artist_name: form.artist_name,
        tagline: epk.copy.tagline || "",
        one_liner: epk.copy.one_liner || "",
        bio: epk.copy.bio || "",
        location: form.location,
        genre: form.genre,
        music_url: form.music_url,
        contact_email: form.contact_email,
        monthly_listeners: Number(form.monthly_listeners) || 0,
        total_streams: Number(form.total_streams) || 0,
        followers: Number(form.followers) || 0,
        social_proof: form.social_proof.filter((p) => p.text?.trim()),
        featured_songs: epk.featured.map((s) => ({ song_id: s.id, title: s.title, genre: s.genre || "" })),
        file_uri,
        active: true,
      });
      setSaved(true);
    } catch (e) {
      setError("Couldn't save the kit to Storage. Try again.");
    }
    setSaving(false);
  };

  const showUpsell = user && getTier(user) !== "ai_manager";

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-7">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">EPK Builder</p>
          <h1 className="font-heading text-4xl font-bold">Electronic Press Kit Generator</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Who you are, what you do, your real numbers and your music in one polished kit. Save it to Storage and Sam attaches it to every pitch.
          </p>
        </motion.div>

        {showUpsell && <EpkUpsellCard />}

        {!epk ? (
          <EpkForm
            form={form}
            setForm={setForm}
            songs={songs}
            selectedSongs={selectedSongs}
            onToggleSong={toggleSong}
            onGenerate={generate}
            generating={generating}
            loading={loading}
            error={error}
          />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Electronic press kit for <strong className="text-foreground">{form.artist_name}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => { setEpk(null); setSaved(false); }}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" className="gap-2" onClick={download}>
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button className="gap-2" onClick={save} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save to Storage
                    </>
                  )}
                </Button>
              </div>
            </div>

            {saved && (
              <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">
                  <span className="font-semibold text-primary">Saved to Storage.</span>{" "}
                  <span className="text-muted-foreground">
                    Sam will find it there and attach it to every pitch it sends for you.
                  </span>
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <EpkPreview epk={epk} form={form} />
          </div>
        )}
      </div>
    </div>
  );
}