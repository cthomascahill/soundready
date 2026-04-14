import { useState } from "react";
import { Mic2, Copy, Check } from "lucide-react";
import ReportCard, { CardHeader, CopyButton } from "./ReportCard";

const PLAYLISTS_BY_GENRE = {
  "Hip Hop": [
    { name: "Unsigned Hype", note: "Favors upcoming rap with raw energy and authentic lyricism" },
    { name: "Hip-Hop Central", note: "Open to melodic trap and boom-bap from independent artists" },
    { name: "Fresh Finds Hip-Hop", note: "Spotify editorial — sends pitches via Spotify for Artists" },
    { name: "No Cap", note: "Covers street rap and drill — submit via SubmitHub" },
    { name: "Lyrical Lemonade Vibes", note: "Creative and visual hip-hop, submit via playlist curator email" },
    { name: "Trap Nation", note: "High-energy trap — accepts via their official website form" },
    { name: "Bars & Hooks", note: "Mixed hip-hop moods, favors strong hooks over pure lyricism" },
    { name: "Real Rap", note: "Underground hip-hop community playlist — accepts via DMs" },
    { name: "New Hip-Hop Songs", note: "Spotify editorial pipeline — pitch via Spotify for Artists" },
    { name: "Rap Caviar Indie", note: "Independent feeder for Rap Caviar — strong production required" },
  ],
  "Pop": [
    { name: "Fresh Finds", note: "Spotify's flagship indie pop discovery playlist — submit via Spotify for Artists" },
    { name: "New Music Friday", note: "Editorial placement — pitch 7+ days before release via S4A" },
    { name: "Pop Rising", note: "Emerging pop artists — Spotify editorial, submit via S4A dashboard" },
    { name: "Viral Hits", note: "TikTok-adjacent pop — strong hook required, submit via SubmitHub" },
    { name: "Bedroom Pop", note: "Lo-fi and indie pop, accepts via email pitch to curator" },
    { name: "Happy Pop Hits", note: "Upbeat pop playlist — submit via Groover or SubmitHub" },
    { name: "Soft Pop Hits", note: "Gentle, melodic pop — great for heartfelt or romantic songs" },
    { name: "Pop Sauce", note: "Diverse pop moods — accepts via SubmitHub" },
    { name: "Alt Pop", note: "Experimental and crossover pop — submit via Groover platform" },
    { name: "Chill Vibes", note: "Mellow pop and R&B crossovers — submit via playlist curator networks" },
  ],
  "R&B": [
    { name: "R&B Vibes", note: "Modern R&B — Spotify editorial, pitch via Spotify for Artists" },
    { name: "Late Night R&B", note: "Sensual and slow-burn tracks — submit via SubmitHub" },
    { name: "R&B Classics & New", note: "Accepts both classic-influenced and modern R&B" },
    { name: "Silk & Soul", note: "Smooth R&B — accepts via Groover pitch campaign" },
    { name: "Alternative R&B", note: "Experimental and neo-soul crossovers — submit via email" },
    { name: "RnB Money", note: "Contemporary R&B with production focus — SubmitHub preferred" },
    { name: "Soul Music", note: "Classic-inspired soul and R&B — accepts via music blog pitches" },
    { name: "New R&B", note: "Emerging R&B artists — Spotify editorial pipeline" },
    { name: "Bedroom R&B", note: "Lo-fi and intimate R&B — accepts via independent curators" },
    { name: "Soulful Vibes", note: "Emotional R&B and neo-soul — submit via SubmitHub or Groover" },
  ],
};

const DEFAULT_PLAYLISTS = [
  { name: "Fresh Finds", note: "Spotify's flagship discovery playlist for emerging artists — submit via Spotify for Artists" },
  { name: "New Music Friday", note: "Major editorial placement — pitch at least 7 days before release" },
  { name: "SubmitHub Curated", note: "Broad independent playlist network — accepts all genres via SubmitHub platform" },
  { name: "Groover Featured", note: "High-conversion pitch platform — curators respond within 7 days" },
  { name: "Indie Picks", note: "Independent music discovery — accepts via direct curator email outreach" },
  { name: "Rising Artists", note: "Emerging talent focus — submit via Spotify for Artists or SubmitHub" },
  { name: "Chill Hits", note: "Mood-based crossover playlist — ideal for relaxed energy tracks" },
  { name: "Viral Music", note: "TikTok-connected playlist — strong opening hook required" },
  { name: "Mood Booster", note: "Feel-good tracks across genres — submit via playlist curator network" },
  { name: "Late Night Vibes", note: "Evening listening playlist — best for atmospheric or emotional tracks" },
];

export default function PlaylistPitch({ pitch, tags = [], artists = [], song = {} }) {
  const genre = song.genre || "";
  const artist = song.artist || "Artist";
  const title = song.title || "this track";

  const playlists = PLAYLISTS_BY_GENRE[genre] || DEFAULT_PLAYLISTS;

  const emailSubject = `Independent Artist Submission — "${title}" by ${artist}`;
  const fullEmail = `Subject: ${emailSubject}

Hi there,

My name is ${artist}, and I'm reaching out to share my latest single "${title}" for playlist consideration.

${pitch}

I believe this track would resonate strongly with your audience and complement the vibe you've built. I'd be honored to have it featured.

Stream/download link: [INSERT LINK]
Spotify: [INSERT SPOTIFY LINK]

Thank you for your time and for supporting independent music.

Warm regards,
${artist}`;

  const dspDescription = `"${title}" is a ${genre.toLowerCase()} track${song.mood ? ` with a ${song.mood.toLowerCase()} mood` : ""} that bridges emotional depth with sonic accessibility. The production balances ${song.energy === "High" ? "high-energy drive" : song.energy === "Low" ? "intimate stillness" : "dynamic contrast"} with a melodic hook designed for repeat listening. The track carries universal themes of ${song.description ? song.description.toLowerCase().slice(0, 60) + "..." : "connection and self-expression"}, making it relevant to a wide audience while retaining a distinctive artistic identity. With ${song.audience || "broad"} appeal and strong replay value, "${title}" is positioned to perform well on mood-based and discovery playlists targeting ${genre} listeners looking for their next favorite track.`;

  const pressRelease = `${artist} returns with "${title}", a ${genre.toLowerCase()} single that ${song.description ? song.description.toLowerCase() : `showcases the artist's signature sound`}. The track blends ${song.mood ? song.mood.toLowerCase() + " energy" : "emotional intensity"} with ${song.energy ? song.energy.toLowerCase() + "-energy production" : "dynamic production"}, creating an immersive listening experience that speaks to ${song.audience || "a wide audience"}. With its strong melodic core and layered sonic texture, "${title}" demonstrates ${artist}'s evolution as an artist and signals an exciting chapter in their career. The single is available now on all major streaming platforms.`;

  return (
    <ReportCard borderColor="border-l-teal-500">
      <CardHeader icon={Mic2} title="Playlist Pitch Toolkit" iconColor="text-teal-400" badge="Section 5" />

      {/* Tags + Artists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">Genre & Mood Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium border border-teal-500/20">{tag}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">Sounds Like</p>
          <div className="flex flex-wrap gap-2">
            {artists.map((a) => (
              <span key={a} className="px-3 py-1 rounded-full bg-secondary text-sm">{a}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Full pitch email */}
      <PitchBlock label="Curator Pitch Email" content={fullEmail} />

      {/* DSP Description */}
      <PitchBlock label="DSP Editorial Description" content={dspDescription} />

      {/* Press Release */}
      <PitchBlock label="Press Release Paragraph" content={pressRelease} />

      {/* Playlist list */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">10 Playlists to Target</p>
        <div className="space-y-2">
          {playlists.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
              <span className="text-xs font-bold text-teal-400 shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}

function PitchBlock({ label, content }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{label}</p>
        <button onClick={copy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <div className="rounded-xl bg-secondary/30 border border-border p-4">
        <pre className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap font-body">{content}</pre>
      </div>
    </div>
  );
}