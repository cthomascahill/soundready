import { motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, Music2 } from "lucide-react";

export const fmtNumber = (n) =>
  Number(n) >= 1000000
    ? (Number(n) / 1000000).toFixed(1) + "M"
    : Number(n) >= 1000
    ? (Number(n) / 1000).toFixed(1) + "K"
    : String(n ?? "");

// The kit is a fixed dark document, so it uses fixed colors that read the same in light and dark mode.
const Label = ({ children }) => (
  <p className="text-[10px] text-[#21c45d] uppercase tracking-widest font-bold">{children}</p>
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
  const where = [form.location, form.genre].filter(Boolean).join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl border border-white/10 overflow-hidden bg-[#0a0d0b]"
    >
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#21c45d]/15 to-transparent pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#21c45d]" />
      <div className="relative p-8 sm:p-12 space-y-9">
        <header className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <Label>Electronic Press Kit</Label>
            <h2 className="font-heading text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              {form.artist_name}
            </h2>
            {copy.tagline && <p className="font-heading text-xl sm:text-2xl font-bold text-[#21c45d]">{copy.tagline}</p>}
            {where && (
              <p className="flex items-center gap-1.5 text-sm text-white/60">
                <MapPin className="h-3.5 w-3.5" /> {where}
              </p>
            )}
          </div>
          {photo && (
            <img src={photo} alt={form.artist_name} className="h-36 w-36 sm:h-44 sm:w-44 rounded-2xl object-cover border border-white/10 shrink-0" />
          )}
        </header>

        <section className="space-y-3">
          <Label>About</Label>
          {copy.one_liner && <p className="text-base font-semibold text-white">{copy.one_liner}</p>}
          <div className="space-y-3 text-sm text-white/80 leading-relaxed">
            {(copy.bio || "").split(/\n{2,}/).filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {stats.length > 0 && (
          <section className="space-y-3">
            <Label>The Numbers</Label>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                  <p className="font-heading text-2xl sm:text-3xl font-black text-[#21c45d]">{fmtNumber(s.value)}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="space-y-3">
            <Label>Featured Songs</Label>
            <div className="space-y-2">
              {featured.slice(0, 6).map((s) => (
                <div key={s.id || s.title} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  {s.artwork_url ? (
                    <img src={s.artwork_url} alt="" className="h-9 w-9 rounded object-cover shrink-0" />
                  ) : (
                    <Music2 className="h-4 w-4 text-[#21c45d] shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-white flex-1 truncate">{s.title}</p>
                  {s.genre && <p className="text-xs text-white/60">{s.genre}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {proof.length > 0 && (
          <section className="space-y-3">
            <Label>Social Proof</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {proof.slice(0, 6).map((p, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm italic text-white/90 leading-relaxed">"{p.text.trim()}"</p>
                  {p.source && <p className="text-xs text-white/60 mt-2">{p.source}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {(form.music_url || form.contact_email) && (
          <footer className="flex flex-wrap items-center gap-3 pt-2">
            {form.music_url && (
              <a
                href={form.music_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#21c45d] text-black text-sm font-bold px-6 py-2.5"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Listen to the music
              </a>
            )}
            {form.contact_email && (
              <span className="inline-flex items-center gap-2 text-sm text-white/60">
                <Mail className="h-3.5 w-3.5" /> {form.contact_email}
              </span>
            )}
          </footer>
        )}
      </div>
    </motion.div>
  );
}