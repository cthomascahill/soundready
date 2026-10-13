import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Mail, MapPin, Music2 } from "lucide-react";

export const fmtNumber = (n) =>
  Number(n) >= 1000000
    ? (Number(n) / 1000000).toFixed(1) + "M"
    : Number(n) >= 1000
    ? (Number(n) / 1000).toFixed(1) + "K"
    : String(n ?? "");

// The kit is a fixed dark document, so it uses fixed colors that read the same in light and dark mode.
const GREEN = "#21c45d";
const Label = ({ children }) => (
  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GREEN }}>
    {children}
  </p>
);

/** The polished Electronic Press Kit preview the artist sees before saving. */
export default function EpkPreview({ epk, form }) {
  const { copy, featured } = epk;
  const photo = form.photo_data || form.photo_url;
  const stats = [
    { label: "Monthly Listeners", value: form.monthly_listeners },
    { label: "Total Streams", value: form.total_streams },
    { label: "Social Followers", value: form.followers },
  ].filter((s) => Number(s.value) > 0);
  const proof = (form.social_proof || []).filter((p) => p.text?.trim());
  const year = new Date().getFullYear();
  const bioParas = (copy.bio || "").split(/\n{2,}/).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl border border-white/10 overflow-hidden bg-[#0a0d0b] text-white"
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,2.4fr)]">
        {/* LEFT PANEL: portrait */}
        <div className="flex flex-col border-b md:border-b-0 md:border-r border-white/10">
          {photo ? (
            <img
              src={photo}
              alt={form.artist_name}
              className="w-full h-72 md:h-auto md:min-h-[440px] object-cover grayscale"
            />
          ) : (
            <div className="w-full h-72 md:h-auto md:min-h-[440px] bg-[#101410] flex items-center justify-center">
              <Music2 className="h-10 w-10 text-white/20" />
            </div>
          )}
          <div className="p-6 space-y-1.5 border-t border-white/10">
            <Label>The Artist</Label>
            <p className="font-heading text-xl font-black uppercase leading-none">{form.artist_name}</p>
            {copy.tagline && <p className="text-sm text-white/70 leading-snug">{copy.tagline}</p>}
          </div>
        </div>

        {/* RIGHT PANEL: header, contact, bio, content */}
        <div className="relative overflow-hidden p-6 sm:p-10 space-y-8">
          {/* geometric accent + faded name watermark, like a pro media kit */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 h-40 w-40 opacity-20"
            style={{ backgroundImage: "radial-gradient(#21c45d 1px, transparent 1px)", backgroundSize: "14px 14px" }}
          />
          <p
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-24 right-2 font-heading font-black uppercase leading-none text-white/[0.04] text-[80px] sm:text-[90px]"
          >
            {form.artist_name || ""}
          </p>

          <header className="relative space-y-4">
            <span
              className="inline-block rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black"
              style={{ background: GREEN }}
            >
              Media Kit {year}
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.85]">
              {form.artist_name}
            </h2>
            {copy.one_liner && <p className="text-base font-semibold text-white">{copy.one_liner}</p>}
          </header>

          <section className="relative space-y-3">
            <Label>Contact</Label>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider text-white/80">
              {form.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" style={{ color: GREEN }} />
                  {form.location}
                </span>
              )}
              {form.genre && (
                <span className="inline-flex items-center gap-1.5">
                  <Music2 className="h-3.5 w-3.5" style={{ color: GREEN }} />
                  {form.genre}
                </span>
              )}
              {form.contact_email && (
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} />
                  <span className="truncate">{form.contact_email}</span>
                </span>
              )}
              {[form.phone, form.website, form.instagram && `IG ${form.instagram}`, form.tiktok && `TikTok ${form.tiktok}`, form.youtube].filter(Boolean).map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} />
                  <span className="truncate">{c}</span>
                </span>
              ))}
              {form.music_url && (
                <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} />
                  <span className="truncate">{form.music_url}</span>
                </span>
              )}
            </div>
          </section>

          <section className="relative space-y-3">
            <Label>Biography</Label>
            <div className="sm:columns-2 gap-6 text-sm text-white/85 leading-relaxed">
              {bioParas.map((p, i) => (
                <p key={i} className="mb-3 break-inside-avoid">
                  {p}
                </p>
              ))}
            </div>
          </section>

          {[["Career Highlights", form.highlights], ["Notable Shows", form.notable_shows]].map(([title, text]) => {
            const items = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
            if (!items.length) return null;
            return (
              <section key={title} className="relative space-y-3">
                <Label>{title}</Label>
                <ul className="space-y-1.5 text-sm text-white/85">
                  {items.slice(0, 10).map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: GREEN }}>•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {featured.length > 0 && (
            <section className="relative space-y-3">
              <Label>Featured Songs</Label>
              <div className="space-y-2">
                {featured.slice(0, 6).map((s, i) => (
                  <div key={s.id || s.title} className="flex items-center gap-3">
                    <span className="font-heading text-sm font-black w-6" style={{ color: GREEN }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-semibold flex-1 truncate">{s.title}</p>
                    {s.genre && <p className="text-xs text-white/60 uppercase tracking-wide">{s.genre}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {proof.length > 0 && (
            <section className="relative space-y-3">
              <Label>Press & Social Proof</Label>
              <div className="space-y-3">
                {proof.slice(0, 6).map((p, i) => (
                  <div key={i}>
                    <p className="text-sm italic text-white/90 leading-relaxed">"{p.text.trim()}"</p>
                    {p.source && <p className="text-xs text-white/60 mt-1 uppercase tracking-wide">{p.source}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* METRIC BAR */}
      {stats.length > 0 && (
        <div className="relative bg-[#0f2417] px-6 sm:px-10 py-5 flex items-center gap-4 overflow-hidden">
          <ChevronLeft className="h-5 w-5 text-white/15 shrink-0 hidden sm:block" />
          <div className="flex-1 grid gap-3 text-center" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl sm:text-4xl font-black leading-none text-white">
                  {fmtNumber(s.value)}
                </p>
                <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
          <ChevronRight className="h-5 w-5 text-white/15 shrink-0 hidden sm:block" />
        </div>
      )}

      {/* FOOTER */}
      <footer className="flex items-center justify-between gap-3 px-6 sm:px-10 py-3 border-t border-white/10 bg-[#0a0d0b]">
        <p className="text-[10px] uppercase tracking-widest text-white/60 truncate">
          {form.music_url || form.contact_email || form.artist_name}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-white/60 shrink-0">Built with SoundReady</p>
      </footer>
    </motion.div>
  );
}