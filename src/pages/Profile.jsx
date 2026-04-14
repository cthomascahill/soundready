import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { User, Mail, Music2, MapPin, Instagram, Globe, Save, Check, LogOut, Crown, Star, Zap, Building2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const PLAN_META = {
  free: { label: "Free", icon: Zap, color: "text-muted-foreground", bg: "bg-secondary" },
  starter: { label: "Starter", icon: Star, color: "text-chart-5", bg: "bg-chart-5/10" },
  pro: { label: "Pro", icon: Crown, color: "text-primary", bg: "bg-primary/10" },
  label: { label: "Label / Manager", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10" },
};

const GENRES = ["Hip Hop", "Pop", "R&B", "Country", "Rock", "EDM", "Latin", "Indie", "Other"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [songCount, setSongCount] = useState(0);
  const [form, setForm] = useState({
    artist_name: "",
    location: "",
    primary_genre: "",
    bio: "",
    website: "",
    instagram: "",
    spotify_url: "",
    avatar_url: "",
    plan: "free",
  });

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 100),
    ]).then(([u, songs]) => {
      setUser(u);
      setSongCount(songs.length);
      setForm({
        artist_name: u.artist_name || "",
        location: u.location || "",
        primary_genre: u.primary_genre || "",
        bio: u.bio || "",
        website: u.website || "",
        instagram: u.instagram || "",
        spotify_url: u.spotify_url || "",
        avatar_url: u.avatar_url || "",
        plan: u.plan || "free",
      });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const plan = PLAN_META[form.plan] || PLAN_META.free;
  const PlanIcon = plan.icon;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Account</p>
          <h1 className="font-heading text-4xl font-bold">Your Profile</h1>
        </motion.div>

        {/* Identity card */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="avatar" className="h-20 w-20 rounded-2xl object-cover border border-border" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-xl">{user?.full_name || "Your Name"}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" />{user?.email}
              </p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full ${plan.bg} text-xs font-semibold`}>
                <PlanIcon className={`h-3.5 w-3.5 ${plan.color}`} />
                <span className={plan.color}>{plan.label} Plan</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Songs Analyzed", value: songCount },
              { label: "Plan", value: plan.label },
              { label: "Member Since", value: user?.created_date ? new Date(user.created_date).getFullYear() : "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-secondary/40 p-3 text-center">
                <p className="font-heading font-bold text-xl">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Artist profile form */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <p className="font-heading font-semibold flex items-center gap-2"><Music2 className="h-4 w-4 text-primary" />Artist Profile</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Artist / Stage Name</label>
              <Input placeholder="e.g. Maya Lane" value={form.artist_name} onChange={set("artist_name")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Location</label>
              <Input placeholder="e.g. Atlanta, GA" value={form.location} onChange={set("location")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Primary Genre</label>
              <select value={form.primary_genre} onChange={set("primary_genre")}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select genre</option>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Avatar Image URL</label>
              <Input placeholder="https://..." value={form.avatar_url} onChange={set("avatar_url")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Bio</label>
            <textarea value={form.bio} onChange={set("bio")} rows={3} placeholder="Tell us about yourself as an artist..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><Globe className="h-3 w-3" />Website</label>
              <Input placeholder="https://yoursite.com" value={form.website} onChange={set("website")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><Instagram className="h-3 w-3" />Instagram URL</label>
              <Input placeholder="https://instagram.com/..." value={form.instagram} onChange={set("instagram")} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><Music2 className="h-3 w-3" />Spotify Artist URL</label>
              <Input placeholder="https://open.spotify.com/artist/..." value={form.spotify_url} onChange={set("spotify_url")} />
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="gap-2">
            {saved ? <><Check className="h-4 w-4" />Saved!</> : saving ? "Saving..." : <><Save className="h-4 w-4" />Save Profile</>}
          </Button>
        </div>

        {/* Plan info */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-heading font-semibold flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />Subscription</p>
            <Link to="/pricing">
              <Button size="sm" variant="outline">View Plans</Button>
            </Link>
          </div>
          <div className={`rounded-xl ${plan.bg} border border-border p-4 flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-3">
              <PlanIcon className={`h-6 w-6 ${plan.color}`} />
              <div>
                <p className="font-semibold">{plan.label}</p>
                <p className="text-xs text-muted-foreground">
                  {form.plan === "free" ? "Free forever" : form.plan === "starter" ? "$9.99 / month" : form.plan === "pro" ? "$24.99 / month" : "$79.99 / month"}
                </p>
              </div>
            </div>
            {form.plan === "free" && (
              <Link to="/pricing"><Button size="sm" className="shrink-0">Upgrade</Button></Link>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
          <p className="font-heading font-semibold text-muted-foreground">Account</p>
          <Button variant="outline" className="gap-2 text-muted-foreground" onClick={() => base44.auth.logout()}>
            <LogOut className="h-4 w-4" />Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}