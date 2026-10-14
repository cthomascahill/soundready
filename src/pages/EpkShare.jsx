import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import EpkPreview from "@/components/epk/EpkPreview";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { AlertTriangle, Download, Loader2 } from "lucide-react";

// Public EPK viewer, an artist shares an /epk/<token> link and anyone can
// open the press kit in the browser, no SoundReady account needed.
export default function EpkShare() {
  const { token } = useParams();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    base44.functions.invoke("epkShare", { action: "get", token })
      .then((res) => setKit(res.data))
      .catch(() => setError("This link is not valid or was turned off."))
      .finally(() => setLoading(false));
  }, [token]);

  const download = async () => {
    setDownloading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("epkShare", { action: "download", token });
      if (!res.data?.signed_url) throw new Error("no url");
      window.open(res.data.signed_url, "_blank");
    } catch {
      setError("Couldn't load the PDF, try again.");
    }
    setDownloading(false);
  };

  const epk = kit && {
    copy: { tagline: kit.tagline, one_liner: kit.one_liner, bio: kit.bio },
    featured: (kit.featured_songs || []).map((s) => ({ id: s.song_id, title: s.title, genre: s.genre })),
  };
  const form = kit && {
    artist_name: kit.artist_name,
    photo_url: kit.photo_url,
    photo_data: "",
    music_url: kit.music_url,
    contact_email: kit.contact_email,
    phone: kit.phone,
    website: kit.website,
    instagram: kit.instagram,
    tiktok: kit.tiktok,
    youtube: kit.youtube,
    highlights: kit.highlights,
    notable_shows: kit.notable_shows,
    location: kit.location,
    genre: kit.genre,
    monthly_listeners: kit.monthly_listeners,
    total_streams: kit.total_streams,
    followers: kit.followers,
    social_proof: kit.social_proof || [],
  };

  return (
    <div className="min-h-screen bg-[#0a0d0b] text-white">
      <SEO title={`${kit?.artist_name || "Artist"}, Electronic Press Kit`} />
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <p className="font-heading font-black tracking-tight">
            sound<span className="text-primary">ready</span>
          </p>
          {kit?.has_pdf && (
            <Button size="sm" className="gap-2" onClick={download} disabled={downloading}>
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download PDF
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !kit ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm">{error || "This link is not valid."}</p>
          </div>
        ) : (
          <>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <EpkPreview epk={epk} form={form} />
          </>
        )}

        <p className="text-center text-xs text-white/40 uppercase tracking-widest">
          Press kit by <Link to="/" className="text-primary font-bold">SoundReady</Link>, the digital music manager
        </p>
      </main>
    </div>
  );
}