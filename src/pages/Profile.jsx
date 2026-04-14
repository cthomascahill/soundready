import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Mail, LogOut, Music2, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GENRES = ["Hip Hop", "Pop", "R&B", "Country", "Rock", "EDM", "Latin", "Indie", "Other"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    artist_name: "",
    bio: "",
    genres: [],
    target_audience: "",
  });

  useEffect(() => {
    base44.auth.me()
      .then((u) => {
        setUser(u);
        setForm({
          artist_name: u.artist_name || "",
          bio: u.bio || "",
          genres: u.genres || [],
          target_audience: u.target_audience || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleInputChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const toggleGenre = (genre) => {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter((g) => g !== genre)
        : [...f.genres, genre],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Account</p>
          <h1 className="font-heading text-4xl font-bold">Profile</h1>
        </div>

        {/* Identity card */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-lg">{user?.full_name || "Guest"}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
          <p className="font-heading font-semibold flex items-center gap-2">
            <Music2 className="h-4 w-4 text-primary" />
            Artist Profile
          </p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Artist Name</label>
              <Input
                placeholder="e.g. Maya Lane"
                value={form.artist_name}
                onChange={handleInputChange("artist_name")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Bio</label>
              <textarea
                placeholder="Tell us about yourself as an artist..."
                value={form.bio}
                onChange={handleInputChange("bio")}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Genres</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      form.genres.includes(genre)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Target Audience</label>
              <select
                value={form.target_audience}
                onChange={handleInputChange("target_audience")}
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select audience</option>
                <option value="Gen Z">Gen Z</option>
                <option value="Millennials">Millennials</option>
                <option value="Gen X">Gen X</option>
                <option value="Everyone">Everyone</option>
                <option value="Niche/Underground">Niche/Underground</option>
              </select>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>

        {/* Logout */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <Button
            variant="outline"
            className="gap-2 text-muted-foreground"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}