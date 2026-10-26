import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Copy, Check, FileText } from "lucide-react";

// The free Spotify playlist pitch template, fill-in-the-blank. Blanks keep
// their bracket placeholders so the template stays useful unfilled too.
export default function PitchTemplateSection() {
  const [f, setF] = useState({
    songTitle: "",
    artistName: "",
    genre: "",
    city: "",
    releaseDate: "",
    playlist: "",
    curator: "",
    sound: "",
    soundsLike: "",
    fit: "",
    context: "",
    link: "",
  });
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const pitch = useMemo(() => {
    const v = (k, fallback) => (f[k] && f[k].trim() ? f[k].trim() : fallback);
    return [
      `Subject: Playlist pitch: "${v("songTitle", "[Song Title]")}" by ${v("artistName", "[Artist Name]")}`,
      "",
      `Hi ${v("curator", "[curator name or editorial team]")},`,
      "",
      `I'm ${v("artistName", "[Artist Name]")}, a ${v("genre", "[genre]")} artist based in ${v("city", "[city]")}. My new single "${v("songTitle", "[Song Title]")}" is out on ${v("releaseDate", "[release date]")}, and I'd love for you to consider it for ${v("playlist", "[playlist name]")}.`,
      "",
      `The song is ${v("sound", "[describe the sound in 2-3 sentences: the energy, the production, the hook]")}. It sits in the same lane as ${v("soundsLike", "[Artist 1], [Artist 2] and [Artist 3]")}.`,
      "",
      `I think it would sit perfectly on ${v("playlist", "[playlist name]")} and similar playlists. ${v("fit", "For example, it's an upbeat, high-energy record that belongs in workout playlists such as Beast Mode, because [why the song fits the moment the playlist is made for]")}.`,
      "",
      `A little context: ${v("context", "[your one or two strongest facts: past placements, sync, press, monthly listeners, momentum]")}.`,
      "",
      `You can hear the track here: ${v("link", "[private streaming link]")}.`,
      "",
      "Thank you for your consideration. I really appreciate you taking the time to listen.",
      "",
      v("artistName", "[Artist Name]"),
    ].join("\n");
  }, [f]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pitch);
      setCopied(true);
      toast({
        title: "Template copied",
        description: "Paste it into your Spotify for Artists pitch or any curator email.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Select the text below and copy it manually.",
        variant: "destructive",
      });
    }
  };

  const field = (key, label, placeholder) => (
    <div key={key} className="space-y-1.5">
      <Label htmlFor={key} className="text-xs font-semibold">{label}</Label>
      <Input id={key} value={f[key]} onChange={set(key)} placeholder={placeholder} className="h-9 text-sm" />
    </div>
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-heading font-bold text-lg">Spotify Playlist Pitch Template</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fill it in, copy, send.
          </p>
        </div>
        <Button size="sm" onClick={copy} className="gap-1.5 shrink-0">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy pitch"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field("songTitle", "Song title", "Midnight Drive")}
        {field("artistName", "Artist name", "Your artist name")}
        {field("genre", "Genre", "Hip-Hop")}
        {field("city", "City", "Denver, CO")}
        {field("releaseDate", "Release date", "November 14")}
        {field("playlist", "Playlist", "Beast Mode")}
        {field("curator", "Curator / team", "Spotify editorial team")}
        {field("link", "Private streaming link", "https://...")}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="sound" className="text-xs font-semibold">What the song sounds like</Label>
          <Textarea id="sound" value={f.sound} onChange={set("sound")} rows={2}
            placeholder="an upbeat, high-energy hip-hop record with a driving 808 and an anthemic hook" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="soundsLike" className="text-xs font-semibold">Sounds like</Label>
          <Input id="soundsLike" value={f.soundsLike} onChange={set("soundsLike")}
            placeholder="J. Cole, Jack Harlow and Cordae" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="context" className="text-xs font-semibold">Strongest context</Label>
          <Input id="context" value={f.context} onChange={set("context")}
            placeholder="opened for Big Ghost at the Bluebird, 40k monthly listeners" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fit" className="text-xs font-semibold">Why it fits that playlist</Label>
          <Textarea id="fit" value={f.fit} onChange={set("fit")} rows={2}
            placeholder="the energy matches the pacing people want in a workout" className="text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Your pitch
        </p>
        <pre className="rounded-xl bg-secondary/50 border border-border p-4 text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed font-body">
          {pitch}
        </pre>
      </div>
    </section>
  );
}