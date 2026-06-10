import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Loader2, Music2, Zap, ArrowLeft, Calendar, Tag, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";
import AlgorithmOutlook from "@/components/report/AlgorithmOutlook";
import PlaylistPitch from "@/components/report/PlaylistPitch";
import ReleaseChecklist from "@/components/report/ReleaseChecklist";
import FirstImpression from "@/components/report/FirstImpression";
import LyricsAnalysis from "@/components/report/LyricsAnalysis";
import Verdict from "@/components/report/Verdict";
import RawAudioData from "@/components/report/RawAudioData";
import WaveformVisual from "@/components/report/WaveformVisual";

export default function SongWorkspace() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ id: songId })
      .then(results => {
        if (results?.length) setSong(results[0]);
        else setSong(null);
      })
      .catch(() => setSong(null))
      .finally(() => setLoading(false));
  }, [songId]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Music2 className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <p className="text-muted-foreground">Song not found.</p>
        <Button onClick={() => navigate("/history")}>Back to Library</Button>
      </div>
    );
  }

  const report = song.full_report || {};
  const audioData = {
    bpm: song.bpm,
    key: song.key,
    duration: song.duration,
    loudness: song.loudness,
    energy: song.energy,
    danceability: song.danceability,
    valence: song.valence,
    waveformData: song.waveform_data,
    energyProfile: song.energy_profile,
    moodTag: song.mood_tag,
  };

  const songObj = {
    title: song.title,
    artist: song.artist_name,
    genre: song.genre,
    mood: song.mood,
    energy: song.energy_level,
    description: song.song_description || "",
    audioUrl: song.file_url,
    audioData,
  };

  const hasAnalysis = !!song.first_impression || !!song.verdict || (song.full_report && Object.keys(song.full_report).length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <button onClick={() => navigate("/history")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Song Library
          </button>

          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Music2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-3xl font-bold truncate">{song.title}</h1>
              <p className="text-muted-foreground">{song.artist_name}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                {song.genre && (
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{song.genre}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{moment(song.created_date).format("MMM D, YYYY")}</span>
                {song.bpm && <span>{song.bpm} BPM</span>}
                {song.key && <span>{song.key}</span>}
              </div>
            </div>
            {!hasAnalysis && (
              <Button className="gap-2 shrink-0" onClick={() => navigate("/release-plan")}>
                <Zap className="h-4 w-4" />
                Run Analysis
              </Button>
            )}
          </div>

          {song.file_url && (
            <WaveformVisual
              title={song.title}
              artist={song.artist_name}
              genre={song.genre}
              audioUrl={song.file_url}
              waveformData={song.waveform_data}
              duration={song.duration}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="analysis">
          <TabsList className="mb-6">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="mastering">Mastering</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="release-plan">Release Plan</TabsTrigger>
            <TabsTrigger value="pitch">Pitch</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            {!hasAnalysis ? (
              <div className="rounded-2xl bg-card border border-dashed border-border p-16 text-center space-y-4">
                <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="font-heading font-semibold text-lg">No analysis yet</p>
                <p className="text-muted-foreground text-sm">Run an AI analysis to get a full release strategy, A&R notes, algorithm outlook, and more.</p>
                <Button onClick={() => navigate("/release-plan")} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Run Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <RawAudioData audioData={audioData} />
                <FirstImpression text={song.first_impression} />
                <LyricsAnalysis lyricsAnalysis={song.lyrics_analysis} lyricsText={song.lyrics} lyricsSource={song.lyrics_source} />
                <AlgorithmOutlook data={report.algorithm_outlook || (song.algorithm_outlook ? song.algorithm_outlook.split("\n") : [])} song={songObj} />
                <Verdict text={song.verdict} />
              </div>
            )}
          </TabsContent>

          {/* Mastering Tab */}
          <TabsContent value="mastering">
            <div className="rounded-2xl bg-card border border-border p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto">
                <Music2 className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="font-heading font-semibold text-lg">AI Mastering</p>
              <p className="text-muted-foreground text-sm">Professional WAV output — AI-tuned EQ, compression, and -14 LUFS normalization for streaming.</p>
              <Button onClick={() => navigate("/mastering")} className="gap-2">
                Master This Track
              </Button>
            </div>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution">
            <ReleaseChecklist song={songObj} />
          </TabsContent>

          {/* Release Plan Tab */}
          <TabsContent value="release-plan">
            {!hasAnalysis ? (
              <div className="rounded-2xl bg-card border border-dashed border-border p-16 text-center space-y-4">
                <p className="font-heading font-semibold text-lg">No release plan yet</p>
                <p className="text-muted-foreground text-sm">Run an analysis to generate a full release strategy and pitching timeline.</p>
                <Button onClick={() => navigate("/release-plan")} className="gap-2">
                  <Zap className="h-4 w-4" />Run Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {report.pre_release_plan?.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                    <h3 className="font-heading font-bold">Pre-Release Timeline</h3>
                    <div className="space-y-3">
                      {report.pre_release_plan.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40">
                          <span className="text-xs font-bold text-primary shrink-0 w-16">{step.day}</span>
                          <p className="text-sm">{step.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.release_day && (
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 space-y-2">
                    <p className="font-heading font-bold">Ideal Release Day</p>
                    <p className="text-primary font-semibold">{report.release_day}</p>
                    {report.release_day_reason && <p className="text-sm text-muted-foreground">{report.release_day_reason}</p>}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Pitch Tab */}
          <TabsContent value="pitch">
            <div className="space-y-5">
              <PlaylistPitch
                pitch={song.playlist_pitch}
                tags={report.genre_mood_tags}
                artists={song.similar_artists || report.similar_artists}
                song={songObj}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-card border border-border p-5 space-y-3">
                  <p className="font-heading font-semibold">Pitch to Playlist Curators</p>
                  <p className="text-sm text-muted-foreground">Find curators and generate personalized pitch emails for this song.</p>
                  <Button variant="outline" onClick={() => navigate("/playlist-pitcher")} className="w-full">Open Playlist Pitcher</Button>
                </div>
                <div className="rounded-xl bg-card border border-border p-5 space-y-3">
                  <p className="font-heading font-semibold">Sync Licensing</p>
                  <p className="text-sm text-muted-foreground">Surface TV, film, game, and commercial sync opportunities for this track.</p>
                  <Button variant="outline" onClick={() => navigate("/sync-pitcher")} className="w-full">Open Sync Pitcher</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}