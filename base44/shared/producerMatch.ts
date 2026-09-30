// Shared beat-vs-artist matching logic.
// Used by the producerMatching function (artist + producer views)
// and the aiProducerPitch function (Maya's auto drafts).

const norm = (s: any): string =>
  s === null || s === undefined ? "" : String(s).toLowerCase().trim();

const tokens = (s: any): string[] =>
  norm(s).split(/[^a-z0-9]+/).filter((t) => t.length > 2);

export function slimBeat(beat: any) {
  return {
    id: beat.id,
    title: beat.title,
    genre: beat.genre,
    bpm: beat.bpm,
    key: beat.key,
    mood_tags: beat.mood_tags || [],
  };
}

function profileTokens(profile: any): Set<string> {
  const set = new Set();
  (profile.genres || []).forEach((g: any) => tokens(g).forEach((t: string) => set.add(t)));
  tokens(profile.subgenre_vibe).forEach((t: string) => set.add(t));
  [profile.sounds_like_1, profile.sounds_like_2, profile.sounds_like_3].forEach((a: any) =>
    tokens(a).forEach((t: string) => set.add(t))
  );
  return set;
}

function beatTokens(beat: any): Set<string> {
  const set = new Set();
  tokens(beat.genre).forEach((t: string) => set.add(t));
  (beat.mood_tags || []).forEach((m: any) => tokens(m).forEach((t: string) => set.add(t)));
  return set;
}

// How well one beat fits one artist profile.
export function scoreBeatForArtist(beat: any, profile: any): { score: number; reasons: string[] } {
  const pt = profileTokens(profile);
  const bt = beatTokens(beat);
  const overlap = [...bt].filter((t) => pt.has(t));
  if (overlap.length === 0) return { score: 0, reasons: [] };

  const reasons = [];
  const genreGenres = (profile.genres || []).join(" / ");
  if (beat.genre && tokens(beat.genre).some((t) => pt.has(t)) && genreGenres) {
    reasons.push(`Genre fit: ${beat.genre} ↔ ${genreGenres}`);
  }
  const moodOverlap = (beat.mood_tags || []).filter((m) => tokens(m).some((t) => pt.has(t)));
  if (moodOverlap.length && profile.subgenre_vibe) {
    reasons.push(`Vibe match: ${moodOverlap.join(" / ")} beats ↔ "${profile.subgenre_vibe}"`);
  }
  if (!reasons.length) {
    reasons.push(`Shared sound keywords: ${overlap.slice(0, 3).join(", ")}`);
  }
  return { score: overlap.length * 2, reasons: reasons.slice(0, 3) };
}

// Rank artists (ArtistProfile records) against a producer's beats.
export function rankArtistsForProducer(beats: any[], profiles: any[]): any[] {
  return (profiles || [])
    .filter((p) => p && p.stage_name)
    .map((profile) => {
      let score = 0;
      const reasons = new Set();
      const fitting: any[] = [];
      (beats || []).forEach((beat) => {
        const r = scoreBeatForArtist(beat, profile);
        if (r.score > 0) {
          score += r.score;
          r.reasons.forEach((x) => reasons.add(x));
          fitting.push({ beat, score: r.score });
        }
      });
      fitting.sort((a, b) => b.score - a.score);
      return {
        profile,
        score,
        reasons: [...reasons].slice(0, 3),
        beats: fitting.slice(0, 3).map((f) => slimBeat(f.beat)),
      };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// Rank producers (grouped from beats) against one artist profile.
export function rankProducersForArtist(profile: any, beats: any[]): any[] {
  const byProducer = new Map();
  (beats || []).forEach((beat) => {
    const r = scoreBeatForArtist(beat, profile);
    if (r.score === 0) return;
    const key = `${beat.producer_name || "Unknown"}|${beat.producer_email || ""}`;
    if (!byProducer.has(key)) {
      byProducer.set(key, {
        producer_name: beat.producer_name || "Unknown producer",
        producer_email: beat.producer_email || "",
        score: 0,
        reasons: new Set(),
        beats: [],
      });
    }
    const p = byProducer.get(key);
    p.score += r.score;
    r.reasons.forEach((x) => p.reasons.add(x));
    p.beats.push(slimBeat(beat));
  });
  return [...byProducer.values()]
    .map((p) => ({ ...p, reasons: [...p.reasons].slice(0, 3), beats: p.beats.slice(0, 3) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}