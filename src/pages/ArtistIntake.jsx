import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save, Check, User, Music2, BarChart2, Share2, Mic2, Briefcase, Target, Film } from "lucide-react";
import ProfileBlock from "@/components/artistprofile/ProfileBlock";
import {
  TextField, NumberField, SelectField, YesNoField,
  MultiSelectField, TextareaField, FieldGroup
} from "@/components/artistprofile/FormField";

// ─── field lists per block for completion tracking ───────────────────────────
const BLOCK_FIELDS = {
  0: ["stage_name","real_name","genres","subgenre_vibe","sounds_like_1","career_stage","city_state","years_active"],
  1: ["songs_released","projects_released","most_recent_release_title","next_release_title","in_studio","release_frequency","writes_own_music","produces_own_music","recording_setup"],
  2: ["spotify_monthly_listeners","apple_music_listeners","youtube_total_views","most_streamed_song_title","spotify_verified","apple_verified","editorial_playlist","avg_stream_count"],
  3: ["tiktok_handle","instagram_handle","youtube_handle","top_traffic_platform","posting_consistency","runs_paid_ads"],
  4: ["performed_live","total_shows","biggest_show_venue","avg_ticket_price","headlines_own_shows","opens_for_artists","been_on_tour","has_booking_agent","markets_performed","avg_show_revenue"],
  5: ["has_manager","has_attorney","has_publicist","distributor","signed_to_label","collects_publishing","pro_registration","annual_music_income"],
  6: ["primary_goal","biggest_challenge","success_in_12_months","willing_to_invest","hours_per_week","has_release_strategy"],
  7: ["interested_in_sync","had_sync_placement","music_cleared_for_licensing"],
};

const ALL_FIELDS = Object.values(BLOCK_FIELDS).flat();

function countFilled(data, fields) {
  return fields.filter((f) => {
    const v = data[f];
    if (v === null || v === undefined || v === "") return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;
}

function totalFilled(data) {
  return countFilled(data, ALL_FIELDS);
}

const GENRES = ["Hip-Hop", "R&B", "Pop", "Rock", "Country", "Electronic", "Indie", "Latin", "Gospel", "Jazz", "Other"];
const MARKETS = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "International"];

export default function ArtistIntake() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeBlock, setActiveBlock] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ArtistProfile.filter({ created_by_id: user.id }, "-created_date", 1)
      .then((results) => {
        if (results.length > 0) {
          setProfile(results[0]);
          setProfileId(results[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const update = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const save = async () => {
    setSaving(true);
    const data = { ...profile };
    if (!data.stage_name) data.stage_name = user?.full_name || "Artist";
    let record;
    if (profileId) {
      record = await base44.entities.ArtistProfile.update(profileId, data);
    } else {
      record = await base44.entities.ArtistProfile.create(data);
      setProfileId(record.id);
    }
    setProfile(record);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const filledTotal = totalFilled(profile);
  const completionPct = Math.round((filledTotal / ALL_FIELDS.length) * 100);

  const BLOCKS = [
    { title: "Identity & Sound", icon: User },
    { title: "Music Catalog", icon: Music2 },
    { title: "Streaming & Analytics", icon: BarChart2 },
    { title: "Social Media", icon: Share2 },
    { title: "Live & Touring", icon: Mic2 },
    { title: "Team & Business", icon: Briefcase },
    { title: "Goals & Focus", icon: Target },
    { title: "Sync & Licensing", icon: Film },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">AI Manager Foundation</p>
          <h1 className="font-heading text-4xl font-bold">Artist Profile</h1>
          <p className="text-muted-foreground text-sm">The more you fill out, the smarter your AI Manager becomes. Every insight, digest, and recommendation pulls from this.</p>
        </motion.div>

        {/* Completion bar */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Profile Completion</p>
            <span className={`text-sm font-bold ${completionPct >= 75 ? "text-primary" : completionPct >= 40 ? "text-yellow-400" : "text-muted-foreground"}`}>{completionPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completionPct < 30 && "⚠️ Your AI Manager can't give specific advice yet — fill out at least Blocks 1–3."}
            {completionPct >= 30 && completionPct < 60 && "Getting there! Complete more sections for hyper-personalized insights."}
            {completionPct >= 60 && completionPct < 90 && "Great progress! Your AI Manager is getting smarter about your career."}
            {completionPct >= 90 && "🔥 Your profile is nearly complete — your AI Manager has everything it needs."}
          </p>
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          {BLOCKS.map((block, i) => (
            <ProfileBlock
              key={i}
              title={block.title}
              icon={block.icon}
              filledCount={countFilled(profile, BLOCK_FIELDS[i])}
              totalCount={BLOCK_FIELDS[i].length}
              isActive={activeBlock === i}
              onClick={() => setActiveBlock(activeBlock === i ? null : i)}
            >
              {i === 0 && <Block0 p={profile} u={update} />}
              {i === 1 && <Block1 p={profile} u={update} />}
              {i === 2 && <Block2 p={profile} u={update} />}
              {i === 3 && <Block3 p={profile} u={update} />}
              {i === 4 && <Block4 p={profile} u={update} />}
              {i === 5 && <Block5 p={profile} u={update} />}
              {i === 6 && <Block6 p={profile} u={update} />}
              {i === 7 && <Block7 p={profile} u={update} />}
            </ProfileBlock>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <p className="text-xs text-muted-foreground">{filledTotal} of {ALL_FIELDS.length} fields filled</p>
          <Button onClick={save} disabled={saving} className="gap-2 px-8">
            {saved ? <><Check className="h-4 w-4" />Saved!</> : saving ? "Saving..." : <><Save className="h-4 w-4" />Save Profile</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Block Components ─────────────────────────────────────────────────────────

function Block0({ p, u }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextField label="Stage Name / Artist Name *" placeholder="e.g. Maya Lane" value={p.stage_name} onChange={(v) => u("stage_name", v)} />
      <TextField label="Real Name (private)" placeholder="Used for legal context only" value={p.real_name} onChange={(v) => u("real_name", v)} />
      <div className="sm:col-span-2">
        <MultiSelectField label="Genre(s)" value={p.genres} onChange={(v) => u("genres", v)} options={GENRES} />
      </div>
      <div className="sm:col-span-2">
        <TextField label="Subgenre / Vibe Description" placeholder='e.g. "dark trap with melodic hooks"' value={p.subgenre_vibe} onChange={(v) => u("subgenre_vibe", v)} />
      </div>
      <TextField label="Sounds Like #1" placeholder="e.g. Drake" value={p.sounds_like_1} onChange={(v) => u("sounds_like_1", v)} />
      <TextField label="Sounds Like #2" placeholder="e.g. J. Cole" value={p.sounds_like_2} onChange={(v) => u("sounds_like_2", v)} />
      <TextField label="Sounds Like #3" placeholder="e.g. Kendrick Lamar" value={p.sounds_like_3} onChange={(v) => u("sounds_like_3", v)} />
      <SelectField label="Career Stage" value={p.career_stage} onChange={(v) => u("career_stage", v)} options={["Just Starting","Developing","Independent with Buzz","Established Independent","Signed"]} />
      <TextField label="City & State / Country" placeholder="e.g. Atlanta, GA" value={p.city_state} onChange={(v) => u("city_state", v)} />
      <NumberField label="Years Active as an Artist" placeholder="e.g. 3" value={p.years_active} onChange={(v) => u("years_active", v)} />
    </div>
  );
}

function Block1({ p, u }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Total Songs Released" placeholder="e.g. 12" value={p.songs_released} onChange={(v) => u("songs_released", v)} />
      <NumberField label="Total Projects Released" placeholder="Singles, EPs, albums" value={p.projects_released} onChange={(v) => u("projects_released", v)} />
      <TextField label="Most Recent Release (Title)" placeholder="Song or project title" value={p.most_recent_release_title} onChange={(v) => u("most_recent_release_title", v)} />
      <FieldGroup label="Most Recent Release Date">
        <input type="date" value={p.most_recent_release_date || ""} onChange={(e) => u("most_recent_release_date", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
      </FieldGroup>
      <TextField label="Next Planned Release (Title)" placeholder="Upcoming song or project" value={p.next_release_title} onChange={(v) => u("next_release_title", v)} />
      <FieldGroup label="Next Release Estimated Date">
        <input type="date" value={p.next_release_date || ""} onChange={(e) => u("next_release_date", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
      </FieldGroup>
      <YesNoField label="Currently in the studio?" value={p.in_studio} onChange={(v) => u("in_studio", v)} />
      <SelectField label="How often do you release?" value={p.release_frequency} onChange={(v) => u("release_frequency", v)} options={["Weekly","Monthly","Every Few Months","Sporadic"]} />
      <YesNoField label="Do you write your own music?" value={p.writes_own_music} onChange={(v) => u("writes_own_music", v)} />
      <YesNoField label="Do you produce your own music?" value={p.produces_own_music} onChange={(v) => u("produces_own_music", v)} />
      <div className="sm:col-span-2">
        <SelectField label="Primary Recording Setup" value={p.recording_setup} onChange={(v) => u("recording_setup", v)} options={["Home Studio","Rented Studio","Producer's Studio","Mix of Both"]} />
      </div>
    </div>
  );
}

function Block2({ p, u }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Spotify Monthly Listeners" placeholder="e.g. 15000" value={p.spotify_monthly_listeners} onChange={(v) => u("spotify_monthly_listeners", v)} />
      <NumberField label="Apple Music Monthly Listeners" placeholder="e.g. 5000" value={p.apple_music_listeners} onChange={(v) => u("apple_music_listeners", v)} />
      <NumberField label="YouTube Total Views" placeholder="e.g. 200000" value={p.youtube_total_views} onChange={(v) => u("youtube_total_views", v)} />
      <NumberField label="Average Stream Count (per song)" placeholder="Estimated" value={p.avg_stream_count} onChange={(v) => u("avg_stream_count", v)} />
      <TextField label="Most Streamed Song (Title)" placeholder="Song name" value={p.most_streamed_song_title} onChange={(v) => u("most_streamed_song_title", v)} />
      <NumberField label="Most Streamed Song (Stream Count)" placeholder="e.g. 50000" value={p.most_streamed_song_count} onChange={(v) => u("most_streamed_song_count", v)} />
      <YesNoField label="Spotify Verified Artist Page?" value={p.spotify_verified} onChange={(v) => u("spotify_verified", v)} />
      <YesNoField label="Apple Music Verified?" value={p.apple_verified} onChange={(v) => u("apple_verified", v)} />
      <YesNoField label="Ever on a Spotify Editorial Playlist?" value={p.editorial_playlist} onChange={(v) => u("editorial_playlist", v)} />
      {p.editorial_playlist === "Yes" && (
        <TextField label="Which Playlist(s)?" placeholder="e.g. Fresh Finds" value={p.editorial_playlist_name} onChange={(v) => u("editorial_playlist_name", v)} />
      )}
    </div>
  );
}

function Block3({ p, u }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextField label="TikTok Handle" placeholder="@handle" value={p.tiktok_handle} onChange={(v) => u("tiktok_handle", v)} />
      <NumberField label="TikTok Followers" placeholder="e.g. 12000" value={p.tiktok_followers} onChange={(v) => u("tiktok_followers", v)} />
      <TextField label="Instagram Handle" placeholder="@handle" value={p.instagram_handle} onChange={(v) => u("instagram_handle", v)} />
      <NumberField label="Instagram Followers" placeholder="e.g. 8500" value={p.instagram_followers} onChange={(v) => u("instagram_followers", v)} />
      <TextField label="YouTube Handle" placeholder="@handle" value={p.youtube_handle} onChange={(v) => u("youtube_handle", v)} />
      <NumberField label="YouTube Subscribers" placeholder="e.g. 3200" value={p.youtube_subscribers} onChange={(v) => u("youtube_subscribers", v)} />
      <TextField label="Twitter/X Handle" placeholder="@handle" value={p.twitter_handle} onChange={(v) => u("twitter_handle", v)} />
      <NumberField label="Twitter/X Followers" placeholder="e.g. 2100" value={p.twitter_followers} onChange={(v) => u("twitter_followers", v)} />
      <TextField label="Facebook Page" placeholder="Page name or URL" value={p.facebook_page} onChange={(v) => u("facebook_page", v)} />
      <NumberField label="Facebook Followers" placeholder="e.g. 1500" value={p.facebook_followers} onChange={(v) => u("facebook_followers", v)} />
      <SelectField label="Top Traffic Platform to Music" value={p.top_traffic_platform} onChange={(v) => u("top_traffic_platform", v)} options={["TikTok","Instagram","YouTube","Twitter/X","Facebook","Other"]} />
      <SelectField label="Posting Consistency" value={p.posting_consistency} onChange={(v) => u("posting_consistency", v)} options={["Daily","Few times a week","Weekly","Inconsistent"]} />
      <YesNoField label="Do you run paid ads?" value={p.runs_paid_ads} onChange={(v) => u("runs_paid_ads", v)} />
      {p.runs_paid_ads === "Yes" && (
        <TextField label="Which ad platforms?" placeholder="e.g. Meta, TikTok Ads" value={p.paid_ads_platforms} onChange={(v) => u("paid_ads_platforms", v)} />
      )}
    </div>
  );
}

function Block4({ p, u }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <YesNoField label="Have you performed live?" value={p.performed_live} onChange={(v) => u("performed_live", v)} />
      <NumberField label="Total Shows (Lifetime)" placeholder="e.g. 45" value={p.total_shows} onChange={(v) => u("total_shows", v)} />
      <NumberField label="Total Tickets Sold (Lifetime, est.)" placeholder="e.g. 2500" value={p.total_tickets_sold} onChange={(v) => u("total_tickets_sold", v)} />
      <TextField label="Biggest Show Venue" placeholder="Venue name" value={p.biggest_show_venue} onChange={(v) => u("biggest_show_venue", v)} />
      <NumberField label="Biggest Show Capacity" placeholder="e.g. 500" value={p.biggest_show_capacity} onChange={(v) => u("biggest_show_capacity", v)} />
      <TextField label="Biggest Show City" placeholder="e.g. New York, NY" value={p.biggest_show_city} onChange={(v) => u("biggest_show_city", v)} />
      <NumberField label="Average Ticket Price ($)" placeholder="e.g. 20" value={p.avg_ticket_price} onChange={(v) => u("avg_ticket_price", v)} />
      <NumberField label="Average Show Revenue ($, est.)" placeholder="Merch + door + guarantee" value={p.avg_show_revenue} onChange={(v) => u("avg_show_revenue", v)} />
      <YesNoField label="Do you headline your own shows?" value={p.headlines_own_shows} onChange={(v) => u("headlines_own_shows", v)} />
      <YesNoField label="Do you open for other artists?" value={p.opens_for_artists} onChange={(v) => u("opens_for_artists", v)} />
      <YesNoField label="Have you been on a tour?" value={p.been_on_tour} onChange={(v) => u("been_on_tour", v)} />
      {p.been_on_tour === "Yes" && (
        <NumberField label="How many cities?" placeholder="e.g. 10" value={p.tour_cities} onChange={(v) => u("tour_cities", v)} />
      )}
      <YesNoField label="Do you have a booking agent?" value={p.has_booking_agent} onChange={(v) => u("has_booking_agent", v)} />
      {p.has_booking_agent === "Yes" && (
        <TextField label="Agency Name" placeholder="e.g. CAA, WME, independent" value={p.booking_agency} onChange={(v) => u("booking_agency", v)} />
      )}
      <YesNoField label="Actively seeking a booking agent?" value={p.seeking_booking_agent} onChange={(v) => u("seeking_booking_agent", v)} />
      <div className="sm:col-span-2">
        <MultiSelectField label="Markets You've Performed In" value={p.markets_performed} onChange={(v) => u("markets_performed", v)} options={MARKETS} />
      </div>
      <div className="sm:col-span-2">
        <SelectField label="Touring Setup" value={p.touring_setup} onChange={(v) => u("touring_setup", v)} options={["Solo (just me)","With a DJ","Full Band","DJ + Band"]} />
      </div>
    </div>
  );
}

function Block5({ p, u }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <YesNoField label="Do you have a manager?" value={p.has_manager} onChange={(v) => u("has_manager", v)} />
      {p.has_manager === "Yes" && (
        <TextField label="Manager / Company Name" placeholder="Name or company" value={p.manager_name} onChange={(v) => u("manager_name", v)} />
      )}
      <YesNoField label="Do you have a music attorney?" value={p.has_attorney} onChange={(v) => u("has_attorney", v)} />
      <YesNoField label="Do you have a publicist?" value={p.has_publicist} onChange={(v) => u("has_publicist", v)} />
      <div className="sm:col-span-2">
        <SelectField label="Distributor" value={p.distributor} onChange={(v) => u("distributor", v)} options={["DistroKid","TuneCore","CD Baby","UnitedMasters","AWAL","Amuse","Label","Other"]} />
      </div>
      <YesNoField label="Signed to a label?" value={p.signed_to_label} onChange={(v) => u("signed_to_label", v)} />
      {p.signed_to_label === "Yes" && (
        <SelectField label="Label Type" value={p.label_type} onChange={(v) => u("label_type", v)} options={["Major","Major Indie","Independent Label"]} />
      )}
      <YesNoField label="Do you have a publishing deal?" value={p.has_publishing_deal} onChange={(v) => u("has_publishing_deal", v)} />
      <YesNoField
        label="Do you collect your publishing royalties?"
        value={p.collects_publishing}
        onChange={(v) => u("collects_publishing", v)}
        tip={p.collects_publishing === "No" ? "⚠️ Tip: You're leaving money on the table. Register with a PRO (ASCAP, BMI, or SESAC) and a publishing administrator like Songtrust or DistroKid Publishing." : null}
      />
      <SelectField label="PRO Registration" value={p.pro_registration} onChange={(v) => u("pro_registration", v)} options={["ASCAP","BMI","SESAC","None"]} />
      <SelectField label="Annual Music Income (estimate)" value={p.annual_music_income} onChange={(v) => u("annual_music_income", v)} options={["Under $5K","$5K–$25K","$25K–$100K","$100K+","Prefer not to say"]} />
    </div>
  );
}

function Block6({ p, u }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <SelectField label="#1 Goal Right Now" value={p.primary_goal} onChange={(v) => u("primary_goal", v)}
        options={["Get a booking agent","Grow streaming numbers","Land a sync deal","Build a fanbase","Get signed","Make a living from music","Headline a major venue","Go viral","Other"]} />
      <TextareaField label="Biggest Challenge Right Now" placeholder="Be honest — what's holding you back?" value={p.biggest_challenge} onChange={(v) => u("biggest_challenge", v)} />
      <TextareaField label="What does success look like for you in 12 months?" placeholder="Be specific — numbers, milestones, feelings..." value={p.success_in_12_months} onChange={(v) => u("success_in_12_months", v)} />
      <SelectField label="Willing to invest money into your career?" value={p.willing_to_invest} onChange={(v) => u("willing_to_invest", v)} options={["Yes actively","Yes but limited budget","Not right now"]} />
      <NumberField label="Hours per week dedicated to music" placeholder="e.g. 20" value={p.hours_per_week} onChange={(v) => u("hours_per_week", v)} />
      <SelectField label="Release Strategy" value={p.has_release_strategy} onChange={(v) => u("has_release_strategy", v)} options={["Detailed strategy","Loose plan","Winging it"]} />
    </div>
  );
}

function Block7({ p, u }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <YesNoField label="Interested in sync licensing (TV, film, ads)?" value={p.interested_in_sync} onChange={(v) => u("interested_in_sync", v)} />
      <YesNoField label="Have you had a sync placement before?" value={p.had_sync_placement} onChange={(v) => u("had_sync_placement", v)} />
      {p.had_sync_placement === "Yes" && (
        <div className="sm:col-span-2">
          <TextField label="Where was it placed?" placeholder="e.g. Netflix show, Nike ad" value={p.sync_placement_where} onChange={(v) => u("sync_placement_where", v)} />
        </div>
      )}
      <div className="sm:col-span-2">
        <SelectField label="Is your music 100% cleared for licensing?" value={p.music_cleared_for_licensing} onChange={(v) => u("music_cleared_for_licensing", v)} options={["Yes","No","Unsure"]} />
      </div>
    </div>
  );
}