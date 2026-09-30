import { useState } from "react";
import { Users, Globe } from "lucide-react";
import SoundReadyMatchTab from "@/components/artistmatch/SoundReadyMatchTab";
import ExternalMatchTab from "@/components/artistmatch/ExternalMatchTab";

/**
 * Artist Match — two sources of artists whose sound fits the producer's beats:
 * artists on SoundReady, and real-world artists Maya finds on the open web.
 */
export default function ArtistMatch() {
  const [tab, setTab] = useState("soundready");

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Artist Match
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Find artists who need your sound — on SoundReady and across the whole world.
          </p>
        </div>

        <div className="flex gap-1">
          {[
            { key: "soundready", label: "On SoundReady" },
            { key: "world", label: "Real-World Artists" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {t.key === "world" && <Globe className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "soundready" ? <SoundReadyMatchTab /> : <ExternalMatchTab />}
      </div>
    </div>
  );
}