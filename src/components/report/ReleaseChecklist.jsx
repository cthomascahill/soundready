import { useState, useEffect } from "react";
import { CheckSquare, Square, ListChecks } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

function buildChecklist(song) {
  const genre = song.genre || "your genre";
  const title = song.title || "your track";
  const platform = song.audience === "Gen Z" ? "TikTok" : song.audience === "Millennials" ? "Instagram" : "TikTok and Instagram";

  return {
    "2 Weeks Before": [
      `Submit "${title}" to DistroKid or your distributor with the release date set exactly 2 weeks out`,
      `Pitch to independent ${genre} playlist curators using your SoundReady pitch package from Section 5`,
      `Record 3 teaser clips using the timestamps from Best Clip Moments — keep them unedited and raw`,
      `Set up your Spotify for Artists pre-save campaign and share the link in your bio`,
    ],
    "1 Week Before": [
      `Post the first teaser clip on ${platform} using Hook 1 timestamp — caption it with release date only`,
      `Email your press release to 5 music blogs that cover ${genre} — no attachments, just the pitch in the body`,
      `Create a 3-second hook clip for TikTok timed to your chorus drop — post it without context`,
      `Reach out to ${genre} playlist curators on SubmitHub or Groover — personalize every message`,
    ],
    "Release Day": [
      `Post the full song link on all platforms at midnight with your strongest visual`,
      `Go live on Instagram or TikTok for 20 minutes and play the song — answer comments in real time`,
      `Post behind-the-scenes content from the making of "${title}" — studio, voice memo, writing session`,
      `DM 20 superfans personally with the link before you post publicly — make them feel like insiders`,
    ],
  };
}

const STORAGE_KEY = (songTitle) => `checklist_${songTitle}`;

export default function ReleaseChecklist({ song = {} }) {
  const key = STORAGE_KEY(song.title || "default");
  const checklist = buildChecklist(song);

  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(checked)); } catch {}
  }, [checked, key]);

  const toggle = (group, idx) => {
    const k = `${group}-${idx}`;
    setChecked((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const totalTasks = Object.values(checklist).flat().length;
  const completedTasks = Object.keys(checked).filter((k) => checked[k]).length;
  const pct = Math.round((completedTasks / totalTasks) * 100);

  const GROUP_COLORS = {
    "2 Weeks Before": "text-chart-5 border-chart-5/30 bg-chart-5/5",
    "1 Week Before": "text-chart-4 border-chart-4/30 bg-chart-4/5",
    "Release Day": "text-primary border-primary/30 bg-primary/5",
  };

  return (
    <ReportCard borderColor="border-l-chart-3">
      <CardHeader icon={ListChecks} title="Your Release Checklist" iconColor="text-chart-3" badge="Section 8" />

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{completedTasks} of {totalTasks} tasks complete</span>
          <span className="font-heading font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-5">
        {Object.entries(checklist).map(([group, tasks]) => {
          const colorClass = GROUP_COLORS[group] || "";
          const [textColor] = colorClass.split(" ");
          return (
            <div key={group}>
              <p className={`text-xs uppercase tracking-widest font-bold mb-3 ${textColor}`}>{group}</p>
              <div className="space-y-2">
                {tasks.map((task, idx) => {
                  const k = `${group}-${idx}`;
                  const done = !!checked[k];
                  return (
                    <button key={idx} onClick={() => toggle(group, idx)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${done ? "bg-primary/5 border-primary/20 opacity-70" : "bg-secondary/20 border-border hover:bg-secondary/40"}`}>
                      {done
                        ? <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        : <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                      <p className={`text-sm leading-relaxed ${done ? "line-through text-muted-foreground" : "text-foreground/90"}`}>{task}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ReportCard>
  );
}