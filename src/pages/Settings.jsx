import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { User, Palette, Megaphone, Music2, Save, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const THEMES = [
  { value: "purple", label: "Purple Neon", color: "bg-purple-500" },
  { value: "cyan", label: "Cyan Wave", color: "bg-cyan-500" },
  { value: "gold", label: "Gold Luxe", color: "bg-yellow-500" },
  { value: "rose", label: "Rose Glow", color: "bg-rose-500" },
  { value: "green", label: "Emerald", color: "bg-emerald-500" },
];

const CAPTION_PLATFORMS = ["Instagram", "TikTok", "Twitter/X", "YouTube Shorts"];

function Section({ icon: Icon, title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-lg">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [assetTheme, setAssetTheme] = useState("purple");
  const [defaultPlatform, setDefaultPlatform] = useState("Instagram");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setDisplayName(u.full_name || "");
      setArtistName(u.artist_name || "");
      setAssetTheme(u.asset_theme || "purple");
      setDefaultPlatform(u.default_caption_platform || "Instagram");
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      artist_name: artistName,
      asset_theme: assetTheme,
      default_caption_platform: defaultPlatform,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!user) return (
    <div className="flex justify-center py-32">
      <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input value={displayName} disabled className="opacity-50 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Managed by your account — contact support to change.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email || ""} disabled className="opacity-50 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <Label>Artist / Stage Name</Label>
            <Input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="How you want to be credited on assets and press sheets"
            />
          </div>
        </div>
      </Section>

      {/* Asset Theme */}
      <Section icon={Palette} title="Default Asset Color Theme">
        <p className="text-sm text-muted-foreground -mt-2">
          Sets the default color palette used when generating marketing assets.
        </p>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setAssetTheme(t.value)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
                assetTheme === t.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary/50 text-muted-foreground hover:border-border/80"
              }`}
            >
              <span className={`h-3.5 w-3.5 rounded-full ${t.color}`} />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Caption Platform */}
      <Section icon={Megaphone} title="Default Caption Platform">
        <p className="text-sm text-muted-foreground -mt-2">
          Pre-selects a platform when you open the Captions & Hooks generator.
        </p>
        <div className="flex flex-wrap gap-2">
          {CAPTION_PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setDefaultPlatform(p)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                defaultPlatform === p
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary/50 text-muted-foreground hover:border-border/80"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </Section>

      {/* Connected Accounts */}
      <Section icon={Music2} title="Connected Accounts">
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#1DB954]/10 flex items-center justify-center">
              <Music2 className="h-4 w-4 text-[#1DB954]" />
            </div>
            <div>
              <p className="text-sm font-medium">Spotify</p>
              <p className="text-xs text-muted-foreground">Track lookup via Spotify Web API</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs font-medium">Connected</span>
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[120px]">
          {saved ? (
            <><Check className="h-4 w-4" />Saved!</>
          ) : saving ? (
            <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
          ) : (
            <><Save className="h-4 w-4" />Save Changes</>
          )}
        </Button>
      </div>
    </div>
  );
}