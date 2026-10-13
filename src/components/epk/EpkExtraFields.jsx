import { Input } from "@/components/ui/input";

const textareaClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none";

/** Extra EPK info: contact details, social links, highlights and notable shows. */
export default function EpkExtraFields({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <p className="font-heading font-semibold">Contact & links</p>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Phone" value={form.phone} onChange={set("phone")} />
          <Input placeholder="Website" value={form.website} onChange={set("website")} />
          <Input placeholder="Instagram @handle" value={form.instagram} onChange={set("instagram")} />
          <Input placeholder="TikTok @handle" value={form.tiktok} onChange={set("tiktok")} />
        </div>
        <Input placeholder="YouTube channel link" value={form.youtube} onChange={set("youtube")} />
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <p className="font-heading font-semibold">More about you</p>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Career highlights (one per line): certifications, awards, milestones</p>
          <textarea
            value={form.highlights}
            onChange={set("highlights")}
            rows={4}
            placeholder={"Gold certified single\nOver 500M career streams\nFeatured on Spotify editorial playlists"}
            className={textareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Notable shows & collaborations (one per line)</p>
          <textarea
            value={form.notable_shows}
            onChange={set("notable_shows")}
            rows={4}
            placeholder={"Opened for Post Malone, Boston\nHeadlined Cambridge Room, 400 cap"}
            className={textareaClass}
          />
        </div>
      </div>
    </>
  );
}