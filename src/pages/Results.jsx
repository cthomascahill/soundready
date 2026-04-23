import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import AlgorithmOutlook from "../components/report/AlgorithmOutlook";
import PlaylistPitch from "../components/report/PlaylistPitch";
import CollabSuggestions from "../components/report/CollabSuggestions";
import WaveformVisual from "../components/report/WaveformVisual";
import ScoreDisplay from "../components/report/ScoreDisplay";
import DownloadPDF from "../components/report/DownloadPDF";
import SimilarArtistsRadar from "../components/report/SimilarArtistsRadar";
import ReleaseChecklist from "../components/report/ReleaseChecklist";
import TikTokScripts from "../components/report/TikTokScripts";
import VisualIdentity from "../components/report/VisualIdentity";
import SocialAssetGenerator from "../components/report/SocialAssetGenerator";
import StickyActionBar from "../components/report/StickyActionBar";

import CollabPanel from "../components/collab/CollabPanel";
import CommentThread from "../components/collab/CommentThread";
import RawAudioData from "../components/report/RawAudioData";
import FirstImpression from "../components/report/FirstImpression";
import LyricsAnalysis from "../components/report/LyricsAnalysis";
import Verdict from "../components/report/Verdict";

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!state?.report) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state?.report) {
    return null;
  }

  const { report, song } = state;

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    const record = await base44.entities.SongAnalysis.create({
      title: song.title,
      artist_name: song.artist,
      genre: song.genre,
      mood: song.mood,
      energy_level: song.energy?.toLowerCase(),
      song_description: song.description,
      algorithm_outlook: report.algorithm_outlook?.join("\n"),
      content_ideas: report.content_video_ideas?.map((v) => `${v.title} (${v.platform}): ${v.description}`).join("\n\n"),
      release_recommendations: `${report.release_day} — ${report.release_day_reason}\n\n` + (report.pre_release_plan || []).map((d) => `${d.day}: ${d.action}`).join("\n"),
      playlist_pitch: report.playlist_pitch,
      similar_artists: report.similar_artists,
      status: "complete",
    });
    setSavedId(record.id);
    setSaved(true);
    setSaving(false);
  };

  const handleDownloadPDF = () => {
    // Trigger the DownloadPDF component programmatically via a hidden ref click
    document.getElementById("pdf-trigger-btn")?.click();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 pb-32">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 pb-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Release Plan Ready</p>
          <h1 className="font-heading text-4xl font-bold">{song.title}</h1>
          <p className="text-muted-foreground">{song.artist} · {song.genre} · {song.mood} · {song.energy} Energy</p>
        </motion.div>

        {/* Real audio data card */}
        <RawAudioData audioData={song.audioData || report._audioData} />

        {/* First Impression — A&R notes */}
        <FirstImpression text={report.firstImpression} />

        {/* Lyrics Analysis — right after first impression */}
        <LyricsAnalysis
          lyricsAnalysis={report.lyricsAnalysis}
          lyricsText={report._lyrics}
          lyricsSource={report._lyricsSource}
        />

        {/* Score — upgraded */}
        <ScoreDisplay genre={song.genre} energy={song.energy} song={song} />

        {/* Waveform */}
        <WaveformVisual
          title={song.title}
          artist={song.artist}
          genre={song.genre}
          audioUrl={song.audioUrl}
          waveformData={song.audioData?.waveformData || report._audioData?.waveformData}
          duration={song.audioData?.duration || report._audioData?.duration}
        />

        {/* All sections */}
        <AlgorithmOutlook data={report.algorithm_outlook} song={song} />
        <PlaylistPitch
          pitch={report.playlist_pitch}
          tags={report.genre_mood_tags}
          artists={report.similar_artists}
          song={song}
        />
        <SimilarArtistsRadar artists={report.similar_artists} song={song} />
        <ReleaseChecklist song={song} />
        <TikTokScripts song={song} tiktokScripts={report.tiktok_scripts} />
        <VisualIdentity song={song} />
        <SocialAssetGenerator song={song} />
        <CollabSuggestions song={song} similarArtists={report.similar_artists} />

        {/* Verdict — closing statement */}
        <Verdict text={report.verdict} />

        {/* Collaboration section */}
        <CollabPanel songAnalysisId={savedId} songTitle={song.title} currentUser={currentUser} />
        <CommentThread songAnalysisId={savedId} songTitle={song.title} currentUser={currentUser} />

        {/* Hidden PDF button trigger */}
        <div className="hidden">
          <DownloadPDF report={report} song={song} triggerId="pdf-trigger-btn" />
        </div>
      </div>

      {/* Sticky action bar */}
      <StickyActionBar
        onSave={handleSave}
        onDownloadPDF={handleDownloadPDF}
        saving={saving}
        saved={saved}
      />
    </div>
  );
}