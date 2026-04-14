import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Music2, Users, Link2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const GENRES = ["Hip Hop", "Pop", "R&B", "Country", "Rock", "EDM", "Latin", "Indie", "Jazz", "Classical", "Electronic", "Trap", "Soul", "Folk", "Alternative"];
const SUB_GENRES = ["Lo-fi", "Synthwave", "Phonk", "Cloud Rap", "Drill", "Grime", "Dubstep", "House", "Techno", "Ambient", "Experimental"];
const AUDIENCES = ["Gen Z", "Millennials", "Gen X", "Everyone", "Niche/Underground"];

const STEPS = [
  { id: 1, title: "Your Role", icon: Briefcase, description: "Choose your profile type" },
  { id: 2, title: "Profile Info", icon: Music2, description: "Tell us about yourself" },
  { id: 3, title: "Preferences", icon: Users, description: "Your genres and style" },
  { id: 4, title: "Social Links", icon: Link2, description: "Connect your platforms" },
];

const ROLES = [
  { id: "artist", label: "Artist", description: "Create and release music", icon: Music2 },
  { id: "manager", label: "Manager", description: "Manage artist careers and tours", icon: Users },
  { id: "label", label: "Label", description: "Release and promote music", icon: Briefcase },
];

export default function OnboardingWizard({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    artist_name: user?.artist_name || "",
    bio: user?.bio || "",
    genres: user?.genres || [],
    sub_genres: user?.sub_genres || [],
    target_audience: user?.target_audience || "",
    social_links: user?.social_links || {
      spotify: "",
      instagram: "",
      tiktok: "",
      twitter: "",
      youtube: "",
      soundcloud: "",
    },
  });

  const set = (k) => (e) => {
    const val = e.target?.value ?? e;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const toggleGenre = (genre) => {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter((g) => g !== genre)
        : [...f.genres, genre],
    }));
  };

  const toggleSubGenre = (subGenre) => {
    setForm((f) => ({
      ...f,
      sub_genres: f.sub_genres.includes(subGenre)
        ? f.sub_genres.filter((g) => g !== subGenre)
        : [...f.sub_genres, subGenre],
    }));
  };

  const setSocialLink = (platform) => (e) => {
    setForm((f) => ({
      ...f,
      social_links: { ...f.social_links, [platform]: e.target.value },
    }));
  };

  const canProceed = () => {
    if (step === 1) return role;
    if (step === 2) return form.artist_name.trim() && form.bio.trim();
    if (step === 3) return form.genres.length > 0 && form.target_audience;
    return true;
  };

  const handleComplete = async () => {
    setLoading(true);
    await base44.auth.updateMe({
      ...form,
      role,
      onboarding_completed: true,
    });
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-12">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isComplete = s.id < step;
            return (
              <div key={s.id} className="flex flex-col items-center flex-1">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary/20 border-2 border-primary text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <p className={`text-xs font-medium text-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </p>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-full mt-4 transition-colors ${
                      isComplete ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl bg-card border border-border p-8 space-y-6"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-role"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <p className="font-heading font-bold text-xl mb-1">What's Your Role?</p>
                  <p className="text-muted-foreground text-sm">You can create profiles for multiple roles later.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${
                          role === r.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto text-primary" />
                        <p className="font-semibold">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <p className="font-heading font-bold text-xl mb-1">
                    {role === "artist" ? "Artist Profile" : role === "manager" ? "Manager Profile" : "Label Profile"}
                  </p>
                  <p className="text-muted-foreground text-sm">Tell us who you are and what you do.</p>
                </div>

                <div className="space-y-2">
                  <Label>{role === "artist" ? "Artist Name / Stage Name" : "Company / Organization Name"} *</Label>
                  <Input
                    placeholder={role === "artist" ? "e.g. Maya Lane" : "e.g. Dream Records"}
                    value={form.artist_name}
                    onChange={set("artist_name")}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bio / About You *</Label>
                  <Textarea
                    placeholder={role === "artist" ? "Tell us about your music, style, and what makes you unique..." : "Tell us about your organization, focus, and mission..."}
                    value={form.bio}
                    onChange={set("bio")}
                    className="min-h-24 resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <p className="font-heading font-bold text-xl mb-1">Music Style & Audience</p>
                  <p className="text-muted-foreground text-sm">What genres and audiences resonate with your sound?</p>
                </div>

                <div className="space-y-3">
                  <Label>Primary Genres *</Label>
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

                <div className="space-y-3">
                  <Label>Sub-Genres / Specific Styles</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUB_GENRES.map((subGenre) => (
                      <button
                        key={subGenre}
                        onClick={() => toggleSubGenre(subGenre)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                          form.sub_genres.includes(subGenre)
                            ? "bg-accent text-accent-foreground border-accent"
                            : "border-border text-muted-foreground hover:border-accent hover:text-foreground"
                        }`}
                      >
                        {subGenre}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience *</Label>
                  <select
                    value={form.target_audience}
                    onChange={set("target_audience")}
                    className="w-full h-11 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select audience</option>
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <p className="font-heading font-bold text-xl mb-1">Connect Your Platforms</p>
                  <p className="text-muted-foreground text-sm">
                    Add your social media links so we can personalize your experience.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { platform: "spotify", label: "Spotify Profile" },
                    { platform: "instagram", label: "Instagram" },
                    { platform: "tiktok", label: "TikTok" },
                    { platform: "twitter", label: "Twitter / X" },
                    { platform: "youtube", label: "YouTube" },
                    { platform: "soundcloud", label: "SoundCloud" },
                  ].map(({ platform, label }) => (
                    <div key={platform} className="space-y-1.5">
                      <Label className="text-sm">{label}</Label>
                      <Input
                        placeholder={`https://...`}
                        value={form.social_links[platform]}
                        onChange={setSocialLink(platform)}
                        className="h-10"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">All fields are optional—you can add these later.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 gap-3">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-1">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1 transition-all ${
                  s.id <= step ? "bg-primary" : "bg-border"
                }`}
                style={{ width: `${100 / STEPS.length}%` }}
              />
            ))}
          </div>

          {step === 4 ? (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {loading ? "Saving..." : "Complete"}
            </Button>
          ) : (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}