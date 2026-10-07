import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import SamLogo from "@/components/SamLogo";
import VoiceButton from "@/components/VoiceButton";
import { Paperclip, X, Loader2, Send, Upload } from "lucide-react";

const EXAMPLES = [
  "Book me a tour across New York City, Boston and Ohio — find the right venues and draft the booking emails.",
  "Send my new single to Warner Music Group, Atlantic Records and Def Jam.",
  "Average my monthly streaming income from these reports and tell me my top-earning song.",
  "Estimate how much I should expect to owe in taxes this year.",
];

export default function TaskComposer({ user, onCreated }) {
  const [prompt, setPrompt] = useState("");
  const [targets, setTargets] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const pickFiles = async (e) => {
    const picked = Array.from(e.target.files || []).slice(0, 5 - files.length);
    if (!picked.length) return;
    setUploading(true);
    const uploaded = [];
    for (const f of picked) {
      try {
        const res = await base44.integrations.Core.UploadPrivateFile({ file: f });
        uploaded.push({ name: f.name, file_uri: res.file_uri });
      } catch (err) {
        setError(`Couldn't upload ${f.name} — try again.`);
      }
    }
    setFiles(prev => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  };

  const removeFile = (uri) => setFiles(prev => prev.filter(f => f.file_uri !== uri));

  const submit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || working) return;
    setWorking(true);
    setError("");
    let created = null;
    try {
      created = await base44.entities.SamTask.create({
        user_id: user.id,
        prompt: trimmed,
        targets: targets.trim(),
        attachments: files,
        status: "working",
      });
      await base44.functions.invoke("samTaskRun", { task_id: created.id });
      setPrompt("");
      setTargets("");
      setFiles([]);
    } catch (err) {
      setError(err.message || "Sam hit a snag — try again.");
    } finally {
      setWorking(false);
      if (created) onCreated(created.id);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-3 space-y-3">
        <div className="flex items-center gap-2.5">
          <SamLogo className="h-5 w-5 text-primary" />
          <p className="font-heading font-bold">Tell Sam what to do — be descriptive</p>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={working}
          rows={5}
          placeholder="e.g. Book me a 5-stop tour through New York City, Boston and Ohio this spring — find venues that fit my sound and draft the booking emails."
          className="border-none bg-secondary/40 p-4 text-sm leading-relaxed focus-visible:ring-0 resize-none"
        />
      </div>

      {/* Use your voice — talk the task instead of typing it */}
      <div className="px-5 pb-3 flex flex-wrap items-center gap-3">
        <VoiceButton size="lg" onText={text => setPrompt(prev => (prev ? prev.trim() + " " : "") + text.trim())} />
        <p className="text-[11px] text-muted-foreground/80 leading-snug">
          Don't feel like typing? Just talk — Sam transcribes as you speak.
        </p>
      </div>

      {/* Example prompts */}
      {!prompt && !working && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setPrompt(ex)}
              className="text-[11px] text-muted-foreground border border-border rounded-full px-3 py-1.5 hover:border-primary/40 hover:text-primary transition-colors">
              {ex.length > 52 ? ex.slice(0, 52) + "…" : ex}
            </button>
          ))}
        </div>
      )}

      {/* Targets */}
      <div className="px-5 pb-3 space-y-1">
        <Input
          value={targets}
          onChange={(e) => setTargets(e.target.value)}
          disabled={working}
          placeholder="Who or where? (optional) — e.g. Warner Music Group, venues under 500 cap in NYC"
          className="border-border bg-secondary/40 text-sm"
        />
      </div>

      {/* Attachments */}
      <div className="px-5 pb-4 space-y-2">
        <input ref={fileInput} type="file" multiple hidden onChange={pickFiles} />
        <div className="flex flex-wrap gap-2">
          {files.map(f => (
            <span key={f.file_uri}
              className="inline-flex items-center gap-1.5 text-xs bg-secondary border border-border rounded-full pl-2.5 pr-1.5 py-1">
              <Paperclip className="h-3 w-3 text-muted-foreground" />
              <span className="max-w-48 truncate">{f.name}</span>
              {!working && (
                <button onClick={() => removeFile(f.file_uri)} className="text-muted-foreground hover:text-red-400 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {uploading && <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</span>}
        </div>
        {!files.length && !uploading && (
          <button onClick={() => fileInput.current?.click()} disabled={working}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Upload className="h-3.5 w-3.5" /> Attach songs or streaming reports (private)
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-border bg-secondary/30">
        <p className="text-[11px] text-muted-foreground/70 leading-snug">
          Sam reads your profile, connected platforms and any files you attach.
        </p>
        <Button onClick={submit} disabled={working || uploading || !prompt.trim()} className="gap-2 font-semibold shrink-0">
          {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {working ? "Sam is on it…" : "Give Sam the task"}
        </Button>
      </div>

      {working && (
        <p className="px-5 pb-4 -mt-1 text-xs text-primary/90 leading-relaxed">
          Sam is researching this now — finding real targets, verifying contacts and writing drafts. This can take a
          minute or two; you can leave this page and check back under your tasks.
        </p>
      )}
      {error && !working && <p className="px-5 pb-4 -mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}