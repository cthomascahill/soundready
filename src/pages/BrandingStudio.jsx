import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Paintbrush } from "lucide-react";
import LogoTab from "@/components/branding/LogoTab";
import ColorsTab from "@/components/branding/ColorsTab";
import FontsTab from "@/components/branding/FontsTab";
import SavedTab from "@/components/branding/SavedTab";

const TABS = ["Logo", "Colors", "Fonts", "Saved"];

export default function BrandingStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Logo");
  const [profile, setProfile] = useState(null);
  const [brandKit, setBrandKit] = useState({ logos: [], palettes: [], font_combos: [] });
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1)
      .then(results => {
        if (results?.length) {
          setProfile(results[0]);
          setProfileId(results[0].id);
          setBrandKit(results[0].brand_kit || { logos: [], palettes: [], font_combos: [] });
        }
      })
      .catch(() => {});
  }, [user]);

  const persistBrandKit = async (newKit) => {
    if (!profileId) return;
    await base44.entities.ArtistProfile.update(profileId, { brand_kit: newKit });
  };

  const handleSave = async (type, item) => {
    const keyMap = { logo: "logos", palette: "palettes", font_combo: "font_combos" };
    const key = keyMap[type];
    const updated = { ...brandKit, [key]: [...(brandKit[key] || []), item] };
    setBrandKit(updated);
    await persistBrandKit(updated);
  };

  const handleDelete = async (type, index) => {
    const keyMap = { logo: "logos", palette: "palettes", font_combo: "font_combos" };
    const key = keyMap[type];
    const updated = { ...brandKit, [key]: (brandKit[key] || []).filter((_, i) => i !== index) };
    setBrandKit(updated);
    await persistBrandKit(updated);
  };

  const savedCount = (brandKit.logos?.length || 0) + (brandKit.palettes?.length || 0) + (brandKit.font_combos?.length || 0);
  const artistName = profile?.stage_name || user?.full_name || "";

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Paintbrush className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Brand Kit</p>
            <h1 className="font-heading text-3xl font-bold">Branding Studio</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-border">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {tab}
              {tab === "Saved" && savedCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "Logo" && (
            <LogoTab artistName={artistName} onSave={handleSave} />
          )}
          {activeTab === "Colors" && (
            <ColorsTab artistName={artistName} onSave={handleSave} />
          )}
          {activeTab === "Fonts" && (
            <FontsTab artistName={artistName} onSave={handleSave} />
          )}
          {activeTab === "Saved" && (
            <SavedTab brandKit={brandKit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}