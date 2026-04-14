import { useState } from "react";
import { Video, Copy, Check } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

function buildScripts(song) {
  const title = song.title || "the track";
  const artist = song.artist || "the artist";
  const mood = (song.mood || "emotional").toLowerCase();
  const genre = song.genre || "music";
  const energy = (song.energy || "medium").toLowerCase();
  const desc = song.description || "a song about real life";

  return [
    {
      label: "Script 1 — Story Behind the Song",
      format: "Storytelling Format",
      color: "border-red-500/30 bg-red-500/5",
      badge: "bg-red-500/15 text-red-400 border-red-500/25",
      script: `[ARTIST ON CAMERA — close up, natural lighting, no filter]
HOOK (0–3s): "This song almost didn't happen. Let me tell you why."

[CUT TO — artist sitting casually, candid]
MIDDLE (3–18s): "I wrote '${title}' on a night when I felt completely ${mood}. I had this voice memo on my phone — just me and [instrument]. I never intended it to be a real song. ${desc.charAt(0).toUpperCase() + desc.slice(1)}. I kept coming back to it. Something about that ${mood} feeling felt too honest to ignore."

[SONG PLAYS softly in background]
CTA (18–25s): [TEXT OVERLAY: "${title.toUpperCase()} — OUT EVERYWHERE FRIDAY"]
"'${title}' is out everywhere Friday. Link in bio. I hope it hits for you the way it hit for me."`,
    },
    {
      label: "Script 2 — The Challenge Concept",
      format: "Duet / Stitch Challenge",
      color: "border-purple-500/30 bg-purple-500/5",
      badge: "bg-purple-500/15 text-purple-400 border-purple-500/25",
      script: `[ARTIST ON CAMERA — standing, good energy]
HOOK (0–3s): "Tell me this ${mood} moment doesn't hit. I dare you."

[SONG PLAYS — chorus drop]
MIDDLE (3–18s): [TEXT OVERLAY: "DUET THIS with your version 👇"]
"This is the part of '${title}' that made me stop everything I was doing. Every time I hear it I'm back in that moment. Show me where YOU were when you first felt this kind of ${mood}."

[ARTIST reacts to imaginary duets, smiles]
CTA (18–25s): [TEXT OVERLAY: "STITCH OR DUET 🎵 ${title.toUpperCase()}"]
"'${title}' drops Friday. Duet this with your reaction — best one gets reposted. Link in bio."`,
    },
    {
      label: "Script 3 — Day in the Life",
      format: "Lifestyle / Ambient Format",
      color: "border-chart-5/30 bg-chart-5/5",
      badge: "bg-chart-5/15 text-chart-5 border-chart-5/25",
      script: `[MONTAGE — ${energy} energy lifestyle clips, natural moments]
HOOK (0–3s): [TEXT OVERLAY: "POV: You found the song for this exact feeling."]

[SONG PLAYS — verse into chorus]
MIDDLE (3–18s): [B-ROLL — artist doing something authentic: driving, cooking, walking, journaling]
[TEXT OVERLAY: "When you're ${mood} and you need a song that gets it..."]
[TEXT OVERLAY: "...this is the one."]

[CHORUS HITS — energy peak clip]
CTA (18–25s): [ARTIST ON CAMERA — direct to lens]
[TEXT OVERLAY: "'${title}' by ${artist} — Out everywhere Friday ✨ Link in bio"]
"'${title}' out Friday. This one's for everyone who needed it."`,
    },
  ];
}

function ScriptBlock({ script }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(script.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${script.color}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="space-y-1">
          <p className="font-heading font-semibold text-sm">{script.label}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${script.badge}`}>{script.format}</span>
        </div>
        <button onClick={copy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
          {copied ? <><Check className="h-3 w-3 text-primary" />Copied!</> : <><Copy className="h-3 w-3" />Copy Script</>}
        </button>
      </div>
      <pre className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap font-body">{script.script}</pre>
    </div>
  );
}

export default function TikTokScripts({ song = {} }) {
  const scripts = buildScripts(song);
  return (
    <ReportCard borderColor="border-l-red-500">
      <CardHeader icon={Video} title="TikTok Launch Scripts" iconColor="text-red-400" badge="Section 9" />
      <p className="text-sm text-muted-foreground -mt-2">Three ready-to-film scripts tailored to your song's mood and genre.</p>
      <div className="space-y-4">
        {scripts.map((s, i) => <ScriptBlock key={i} script={s} />)}
      </div>
    </ReportCard>
  );
}