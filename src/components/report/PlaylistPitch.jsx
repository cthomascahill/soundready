import { useState } from "react";
import { Mic2, Copy, Check } from "lucide-react";
import ReportSection from "../ReportSection";

export default function PlaylistPitch({ pitch, tags = [], artists = [] }) {
  const [copied, setCopied] = useState(false);

  const copyPitch = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ReportSection number={5} title="Playlist Pitch" icon={Mic2} color="text-accent">
      <div className="space-y-5">
        {/* Pitch paragraph */}
        <div className="rounded-xl bg-secondary/50 border border-border p-4 relative">
          <p className="text-sm text-foreground/90 leading-relaxed italic">{pitch}</p>
          <button
            onClick={copyPitch}
            className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tags */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">Genre & Mood Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Similar artists */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">Sounds Like</p>
            <div className="flex flex-wrap gap-2">
              {artists.map((a) => (
                <span key={a} className="px-3 py-1 rounded-full bg-secondary text-sm">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ReportSection>
  );
}