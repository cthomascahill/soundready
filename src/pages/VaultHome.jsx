import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isProOrAbove } from "@/lib/tier";
import { awardPoints } from "@/lib/awardPoints";
import { cleanSongTitle, isAudioFile } from "@/lib/audioFiles";
import { mirrorVaultSongsToTracker } from "@/lib/vaultTrackerSync";
import { organizeFiles, fingerprintFile, pickBestVersion } from "@/lib/vaultIntake";
import VaultCapPrompt, { FREE_VAULT_CAP } from "@/components/vault/VaultCapPrompt";
import FolderDropZone from "@/components/vaulthome/FolderDropZone";
import IntakeSummary from "@/components/vaulthome/IntakeSummary";
import NeedsReviewList from "@/components/vaulthome/NeedsReviewList";
import SongGroupCard from "@/components/vaulthome/SongGroupCard";
import ReleasePlanDialog from "@/components/vault/ReleasePlanDialog";
import { AlertCircle, Loader2 } from "lucide-react";

const MAX_BATCH = 100;
const pipeKey = (t) => t?.toLowerCase().trim();

/**
 * The logged-in home: vault-first. Drop an entire music folder, SAM builds
 * the organized song vault (versions grouped, duplicates found, unsure files
 * held for review), and "Plan release" starts the release workflow only when
 * the artist decides a song matters.
 */
export default function VaultHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [pipeByTitle, setPipeByTitle] = useState(new Map());
  const [versionsByPipeline, setVersionsByPipeline] = useState({});
  const [reviewItems, setReviewItems] = useState([]);
  const [intake, setIntake] = useState({ phase: "idle" });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [capPrompt, setCapPrompt] = useState(false);
  const [planSong, setPlanSong] = useState(null);
  const [busyReview, setBusyReview] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const isFree = !!user && !isProOrAbove(user);

  const refreshData = async () => {
    const [songList, pipelines, versions, reviewList] = await Promise.all([
      base44.entities.SongVault.filter({ created_by_id: user.id }, "-created_date", 200),
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, "sort_order", 500),
      base44.entities.SongVersion.list("-created_date", 500),
      base44.entities.VaultIntakeFile.filter({ created_by_id: user.id, status: "needs_review" }, "-created_date", 100),
    ]);
    setSongs(songList);
    setPipeByTitle(new Map(pipelines.map((p) => [pipeKey(p.song_name), p])));
    setVersionsByPipeline(
      versions.reduce((acc, v) => {
        (acc[v.pipeline_song_id] ||= []).push(v);
        return acc;
      }, {})
    );
    setReviewItems(reviewList);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    refreshData().catch(() => setLoading(false));
  }, [user?.id]);

  const runIntake = async (fileList) => {
    const audio = Array.from(fileList).filter(isAudioFile).slice(0, MAX_BATCH);
    if (!audio.length) return;
    const batchId = crypto.randomUUID?.() || String(Date.now());
    setError("");
    setSummary(null);
    setIntake({ phase: "reading", done: 0, total: audio.length });

    try {
      // 1. Fingerprint for exact-duplicate detection
      const analyzed = [];
      for (let i = 0; i < audio.length; i++) {
        analyzed.push({ file: audio[i], name: audio[i].name, size: audio[i].size, hash: await fingerprintFile(audio[i]) });
        setIntake({ phase: "reading", done: i + 1, total: audio.length });
      }

      // 2. Organize: groups, exact duplicates, review queue
      const plan = organizeFiles(analyzed);

      let accepted = plan.groups;
      if (isFree) {
        const remaining = Math.max(0, FREE_VAULT_CAP - songs.length);
        if (plan.groups.length > remaining) {
          accepted = plan.groups.slice(0, remaining);
          setCapPrompt(true);
        }
      }

      const uploadTotal =
        accepted.reduce((n, g) => n + g.files.length, 0) + plan.duplicates.length + plan.review.length;
      setIntake({ phase: "organizing", done: 0, total: uploadTotal });
      let done = 0;
      const bump = () => setIntake((p) => ({ ...p, done: ++done }));

      const createdSongs = [];
      const versionRows = [];
      const pipelineRows = [];
      const intakeRecords = [];

      // 3. Auto-file the confident groups: one vault song per group
      for (const group of accepted) {
        const uploaded = [];
        for (const member of group.files) {
          const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: member.file });
          uploaded.push({ ...member, file_uri });
          bump();
        }
        const best = pickBestVersion(uploaded);
        const song = await base44.entities.SongVault.create({
          title: group.title,
          status: group.stage || "Demo",
          file_url: best.file_uri,
          file_name: best.name,
        });
        awardPoints("song_uploaded", song.id, `Added "${song.title}" to the Vault`);
        createdSongs.push(song);
        pipelineRows.push({
          song_title: group.title,
          file_uri: best.file_uri,
          label: best.analysis.versionLabel || cleanSongTitle(best.name),
        });

        const labelsSeen = new Set();
        for (const u of uploaded) {
          let label = u.analysis.versionLabel || cleanSongTitle(u.name);
          if (labelsSeen.has(label)) label = `${label} (${u.name})`;
          labelsSeen.add(label);
          versionRows.push({ song_title: group.title, label, file_uri: u.file_uri, is_current: u === best });
          intakeRecords.push({
            user_id: user.id,
            batch_id: batchId,
            original_filename: u.name,
            file_uri: u.file_uri,
            file_size: u.size,
            file_hash: u.hash,
            status: "auto_grouped",
            group_key: group.key,
            suggested_title: group.title,
            version_label: u.analysis.versionLabel || "",
            suggested_stage: u.analysis.stage || group.stage || "Demo",
            stage_from_filename: !!u.analysis.stage,
            song_id: song.id,
            reason:
              u === best
                ? `Grouped under "${group.title}"${group.files.length > 1 ? ` with ${group.files.length - 1} other version${group.files.length > 2 ? "s" : ""}` : ""}${u.analysis.stage ? ` — ${u.analysis.stage} read from the filename` : ""}. Set as the current version.`
                : `Grouped under "${group.title}" as a version${u.analysis.stage ? ` (${u.analysis.stage})` : ""}.`,
          });
        }
      }

      // 4. Exact duplicates: preserved in storage, never double-added
      for (const dup of plan.duplicates) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: dup.file });
        bump();
        intakeRecords.push({
          user_id: user.id,
          batch_id: batchId,
          original_filename: dup.name,
          file_uri,
          file_size: dup.size,
          file_hash: dup.hash,
          status: "auto_grouped",
          is_exact_duplicate: true,
          duplicate_of: dup.duplicate_of,
          reason: `Exact duplicate of "${dup.duplicate_of}" — the original is in your vault; this copy is stored but not added twice.`,
        });
      }

      // 5. Uncertain files wait for the artist
      const reviewRecords = [];
      for (const f of plan.review) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: f.file });
        bump();
        reviewRecords.push({
          user_id: user.id,
          batch_id: batchId,
          original_filename: f.name,
          file_uri,
          file_size: f.size,
          file_hash: f.hash,
          status: "needs_review",
          suggested_title: f.suggestedTitle,
          version_label: f.analysis.versionLabel || "",
          suggested_stage: f.analysis.stage || "",
          reason: "SAM couldn't tell the song from this filename — name it and it joins the vault.",
        });
      }

      // 6. Mirror into the Tracker and attach every version to it
      await mirrorVaultSongsToTracker(createdSongs);
      const pipelines = await base44.entities.PipelineSong.list("-created_date", 500);
      const pipeMap = new Map(pipelines.map((p) => [pipeKey(p.song_name), p]));

      const versionCreates = versionRows
        .map((v) => {
          const p = pipeMap.get(pipeKey(v.song_title));
          return p
            ? { pipeline_song_id: p.id, song_title: v.song_title, label: v.label, file_uri: v.file_uri, is_current: v.is_current }
            : null;
        })
        .filter(Boolean);
      if (versionCreates.length) await base44.entities.SongVersion.bulkCreate(versionCreates);

      const pipelineUpdates = pipelineRows
        .map((pu) => {
          const p = pipeMap.get(pipeKey(pu.song_title));
          return p ? { id: p.id, audio_file_uri: pu.file_uri, audio_version_label: pu.label } : null;
        })
        .filter(Boolean);
      if (pipelineUpdates.length) await base44.entities.PipelineSong.bulkUpdate(pipelineUpdates);

      for (const rec of intakeRecords) {
        const p = pipeMap.get(pipeKey(rec.suggested_title));
        if (p) rec.pipeline_song_id = p.id;
      }

      if (reviewRecords.length) await base44.entities.VaultIntakeFile.bulkCreate(reviewRecords);
      if (intakeRecords.length) await base44.entities.VaultIntakeFile.bulkCreate(intakeRecords);

      setSummary({
        files: audio.length,
        songs: createdSongs.length,
        versions: versionCreates.length,
        duplicates: plan.duplicates.length,
        review: reviewRecords.length,
        skipped: plan.groups.length - accepted.length,
      });
      setIntake({ phase: "done", done: uploadTotal, total: uploadTotal });
      await refreshData();
    } catch (e) {
      setError("Something went wrong while SAM was organizing your folder — try again.");
      setIntake({ phase: "idle" });
    }
  };

  const confirmReview = async (item, title) => {
    if (isFree && songs.length >= FREE_VAULT_CAP) { setCapPrompt(true); return; }
    setBusyReview(item.id);
    setError("");
    try {
      const song = await base44.entities.SongVault.create({
        title: title.trim(),
        status: item.suggested_stage || "Demo",
        file_url: item.file_uri,
        file_name: item.original_filename,
      });
      awardPoints("song_uploaded", song.id, `Added "${song.title}" to the Vault`);
      await mirrorVaultSongsToTracker([song]);
      const pipelines = await base44.entities.PipelineSong.list("-created_date", 500);
      const p = pipelines.find((x) => pipeKey(x.song_name) === pipeKey(song.title));
      if (p) {
        const label = item.version_label || "Version 1";
        await base44.entities.SongVersion.create({
          pipeline_song_id: p.id,
          song_title: song.title,
          label,
          file_uri: item.file_uri,
          is_current: true,
        });
        await base44.entities.PipelineSong.update(p.id, { audio_file_uri: item.file_uri, audio_version_label: label });
        await base44.entities.VaultIntakeFile.update(item.id, {
          status: "confirmed",
          song_id: song.id,
          pipeline_song_id: p.id,
          suggested_title: title.trim(),
        });
      } else {
        await base44.entities.VaultIntakeFile.update(item.id, {
          status: "confirmed",
          song_id: song.id,
          suggested_title: title.trim(),
        });
      }
      await refreshData();
    } catch (e) {
      setError("Couldn't add that file as a song — try again.");
    }
    setBusyReview(null);
  };

  const dismissReview = async (item) => {
    setBusyReview(item.id);
    try {
      await base44.entities.VaultIntakeFile.update(item.id, { status: "dismissed" });
      setReviewItems((prev) => prev.filter((r) => r.id !== item.id));
    } catch {
      setError("Couldn't dismiss that file — try again.");
    }
    setBusyReview(null);
  };

  const intakeBusy = intake.phase === "reading" || intake.phase === "organizing";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        {/* One calm header — the library is the main event */}
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">Vault</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {songs.length === 0
              ? "Drop your music below and SAM builds your song library."
              : `${songs.length} ${songs.length === 1 ? "song" : "songs"} · versions grouped automatically`}
          </p>
        </div>

        <FolderDropZone onFiles={runIntake} disabled={intakeBusy} compact={songs.length > 0} />

        {intakeBusy && (
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-5 py-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                {intake.phase === "reading" ? "Reading your files…" : "SAM is organizing your music…"}
              </p>
              <p className="text-xs text-muted-foreground">{intake.done} of {intake.total}</p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <IntakeSummary summary={summary} />

        {/* Review — one quiet signpost; the details open only on demand */}
        {reviewItems.length > 0 && (
          showReview ? (
            <NeedsReviewList
              items={reviewItems}
              busyId={busyReview}
              onConfirm={confirmReview}
              onDismiss={dismissReview}
              onCollapse={() => setShowReview(false)}
            />
          ) : (
            <button
              onClick={() => setShowReview(true)}
              className="w-full flex items-center gap-2.5 rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-4 py-3 text-left hover:bg-yellow-500/10 transition-colors"
            >
              <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
              <span className="text-sm font-medium flex-1">
                {reviewItems.length} {reviewItems.length === 1 ? "file needs" : "files need"} a name
              </span>
              <span className="text-xs text-muted-foreground shrink-0">Review</span>
            </button>
          )
        )}

        {/* The library */}
        <section className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : songs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {songs.map((song) => (
                <SongGroupCard
                  key={song.id}
                  song={song}
                  versions={versionsByPipeline[pipeByTitle.get(pipeKey(song.title))?.id] || []}
                  onPlanRelease={setPlanSong}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {planSong && <ReleasePlanDialog song={planSong} onClose={() => setPlanSong(null)} />}
      {capPrompt && <VaultCapPrompt kind="song" onClose={() => setCapPrompt(false)} />}
    </div>
  );
}