import { cleanSongTitle } from "@/lib/audioFiles";

// SAM's vault intake engine: turn a messy folder of audio files into
// organized songs — no tagging, no forms. Only high-confidence calls are
// applied automatically; everything SAM isn't sure about is marked for review.

// Version/stage tokens SAM looks for in a filename, strongest match first.
// label      = fixed version label
// labelNum   = label with the captured number appended, e.g. "Mix " + "2"
const VERSION_TOKENS = [
  { re: /\bfinal\s+master\b|\bmaster\s+final\b/i, stage: "Mastered", label: "Final Master" },
  { re: /\bmastered\b|\bmaster\b/i, stage: "Mastered", label: "Master" },
  { re: /\bmix\s*down\b|\bmixdown\b/i, stage: "Mixed", label: "Mixdown" },
  { re: /\brough\s+mix\b/i, stage: "Mixed", label: "Rough Mix" },
  { re: /\bmix\s*v?\.?\s*(\d{1,3})\b/i, stage: "Mixed", labelNum: "Mix " },
  { re: /\bmix\b/i, stage: "Mixed", label: "Mix" },
  { re: /\btake\s*(\d{1,3})\b/i, stage: "Recorded", labelNum: "Take " },
  { re: /\b(bounce|session|reference|ref)\b/i, stage: "Recorded", label: "Recording" },
  { re: /\bdemo\b/i, stage: "Demo", label: "Demo" },
  { re: /\b(rough|wip|draft|sketch)\b/i, stage: "Demo", label: "Rough" },
  { re: /\bfinal\b/i, stage: null, label: "Final" },
  { re: /\bv(?:er(?:sion)?)?\.?\s*(\d{1,3})\b/i, stage: null, labelNum: "V" },
];

// Words that, once everything else is stripped, don't actually name a song
const NON_TITLE_WORDS = /\b(untitled|audio|track|song|recording|new|idea|project|file|export|bounce|demo|rough|mix|mixdown|master|final|take|session|instrumental|acapella|verse|hook|beat)\b/gi;

export const STAGE_RANK = { Demo: 0, Recorded: 1, Mixed: 2, Mastered: 3 };

/**
 * Reads a filename the way an artist's messy folder actually looks:
 * "01 - artist - midnight drive_MASTER_v2.wav" → title "Midnight Drive",
 * version label "V2", stage "Mastered".
 */
function scanTokens(work) {
  let stage = null;
  let versionLabel = null;

  // Pull out every version/stage token, strongest first, until none remain
  const grabOnce = (text) => {
    for (const token of VERSION_TOKENS) {
      const m = text.match(token.re);
      if (!m) continue;
      if (token.stage && !stage) stage = token.stage;
      if (!versionLabel) {
        versionLabel = token.labelNum ? `${token.labelNum}${m[1] || ""}`.trim() : token.label;
      }
      return text.replace(token.re, " ");
    }
    return text;
  };

  // Underscores are word characters, so "MASTER_v2" reads as one word to the
  // token rules — normalize them away first
  work = work.replace(/_+/g, " ");
  // Bracketed extras first — "(Master)", "[v2]" — then the bare name
  let text = work.replace(/[([[][^)\]]*[\])]/g, (b) => ` ${b.slice(1, -1)} `);
  let prev;
  do { prev = text; text = grabOnce(text); } while (text !== prev);

  const title = text
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const meaningful = title.replace(NON_TITLE_WORDS, " ").replace(/[^a-z]/gi, "");
  const valid = meaningful.length >= 2 && /[a-z]/i.test(title);
  return { title, stage, versionLabel, valid };
}

export function parseFilename(filename = "") {
  const stem = filename
    .replace(/\.[^.]+$/, "")
    .replace(/^\s*\d{1,3}\s*[-._)–—]?\s*/, "");
  const segments = stem.split(/\s+-\s+/);

  // "Artist - Title" convention: the last segment usually names the song.
  // But a segment that's only a version marker ("Midnight Drive - mix 3")
  // means the whole name is the song, so fall back to the full stem.
  let parsed = scanTokens(segments.length > 1 ? segments[segments.length - 1] : stem);
  if (!parsed.valid && segments.length > 1) parsed = scanTokens(stem);

  const groupKey = parsed.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  return { title: parsed.title, groupKey, versionLabel: parsed.versionLabel, stage: parsed.stage, valid: parsed.valid };
}

/**
 * Fingerprint for exact-duplicate detection: SHA-256 over the file size plus
 * its first and last megabyte — byte-identical files always match, and it
 * never reads a whole 50 MB bounce into memory.
 */
export async function fingerprintFile(file) {
  try {
    const HEAD = 1024 * 1024;
    const head = await (file.size > HEAD ? file.slice(0, HEAD) : file).arrayBuffer();
    const tail = file.size > HEAD * 2 ? await file.slice(file.size - HEAD).arrayBuffer() : new ArrayBuffer(0);
    const prefix = new TextEncoder().encode(`${file.size}:`);
    const merged = new Uint8Array(prefix.length + head.byteLength + tail.byteLength);
    merged.set(prefix, 0);
    merged.set(new Uint8Array(head), prefix.length);
    merged.set(new Uint8Array(tail), prefix.length + head.byteLength);
    const digest = await crypto.subtle.digest("SHA-256", merged);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `noid-${file.size}-${file.name}`;
  }
}

/**
 * Organizes a batch of files: exact duplicates are separated out, files whose
 * names clearly name a song are grouped by song (one group = one song), and
 * files SAM can't confidently name go to review.
 *
 * files: [{ file, name, size, hash }]
 */
export function organizeFiles(files) {
  const byHash = new Map();
  const groups = new Map();
  const duplicates = [];
  const review = [];
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));

  for (const f of sorted) {
    if (f.hash && byHash.has(f.hash)) {
      duplicates.push({ ...f, duplicate_of: byHash.get(f.hash) });
      continue;
    }
    if (f.hash) byHash.set(f.hash, f.name);

    const analysis = parseFilename(f.name);
    if (!analysis.valid) {
      review.push({ ...f, analysis, suggestedTitle: cleanSongTitle(f.name) });
      continue;
    }
    if (!groups.has(analysis.groupKey)) {
      groups.set(analysis.groupKey, { key: analysis.groupKey, title: analysis.title, stage: null, files: [] });
    }
    const g = groups.get(analysis.groupKey);
    g.files.push({ ...f, analysis });
    if (analysis.stage && (!g.stage || STAGE_RANK[analysis.stage] > STAGE_RANK[g.stage])) {
      g.stage = analysis.stage;
    }
  }

  return { groups: [...groups.values()], duplicates, review };
}

/** The file that best represents the song: a master over a mix over a demo, biggest file wins ties. */
export function pickBestVersion(members) {
  const score = (m) =>
    (/master/i.test(m.analysis.versionLabel || "") ? 1e12 : 0) +
    (STAGE_RANK[m.analysis.stage] ?? 0) * 1e9 +
    (m.size || 0);
  return [...members].sort((a, b) => score(b) - score(a))[0];
}