import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Save, Check, Loader2 } from "lucide-react";

/**
 * Public profile editor for the Profile page — the card other creators
 * see when they visit your public profile page.
 */
export default function PublicProfileCard() {
  const { user } = useAuth();
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({ display_name: "", bio: "", city: "", genres: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.PublicProfile
      .filter({ user_id: user.id })
      .then((existing) => {
        if (existing[0]) {
          setProfileId(existing[0].id);
          setForm({
            display_name: existing[0].display_name || "",
            bio: existing[0].bio || "",
            city: existing[0].city || "",
            genres: (existing[0].genres || []).join(", "),
            avatar_url: existing[0].avatar_url || "",
          });
        } else {
          setForm((f) => ({ ...f, display_name: user.full_name || "" }));
        }
      })
      .catch(() => {});
  }, [user?.id, user?.full_name]);

  const uploadAvatar = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm((f) => ({ ...f, avatar_url: file_url }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        user_id: user.id,
        display_name: form.display_name.trim() || user.full_name || "Creator",
        bio: form.bio.trim(),
        city: form.city.trim(),
        genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean),
        avatar_url: form.avatar_url,
        account_type: user.account_type || "artist",
      };
      const result = profileId
        ? await base44.entities.PublicProfile.update(profileId, payload)
        : await base44.entities.PublicProfile.create(payload);
      setProfileId(result.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
      <div>
        <p className="font-heading font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Public Profile
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          What other creators see when they visit your public profile page.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {form.avatar_url ? (
          <img src={form.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover border border-border" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xl">
            {(form.display_name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload photo"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadAvatar(e.target.files[0])} />
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Display Name</label>
          <Input
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            placeholder="How other creators see you"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">City</label>
          <Input
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="e.g. Atlanta, GA"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Genres</label>
          <Input
            value={form.genres}
            onChange={(e) => setForm((f) => ({ ...f, genres: e.target.value }))}
            placeholder="Comma separated, e.g. Hip-Hop, R&B"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            placeholder="A line or two about you…"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="gap-2">
        {saved ? (
          <><Check className="h-4 w-4" />Saved!</>
        ) : saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
        ) : (
          <><Save className="h-4 w-4" />Save Public Profile</>
        )}
      </Button>
    </div>
  );
}