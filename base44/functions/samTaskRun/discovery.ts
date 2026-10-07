import { CURATED_COMPANIES, matchCompanies } from '../../shared/labelDirectory.ts';

// Wide research sweep for non-venue prospecting tasks ("find record labels",
// "find distributors", "find sync libraries", "find blogs"...). One web search
// only ever surfaces a handful of names, so Sam first plans several different
// search angles, runs them in parallel, merges everything with the curated
// directory, and hands the full candidate pool to the main drafting pass.

const MODEL = 'gemini_3_flash';
const CATEGORIES = ['venue', 'label', 'distributor', 'sync', 'playlist', 'press', 'other', 'none'];

const KIND_LABEL = {
  label: 'record labels',
  distributor: 'music distributors and publishing administrators',
  sync: 'sync licensing libraries, agencies and music supervisors',
  playlist: 'playlist curators and playlist-pitching outlets',
  press: 'music blogs, journalists, radio shows and podcasts',
  other: 'companies or people',
};

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timed out')), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function isProspecting(plan) {
  return !!plan && !['venue', 'none'].includes(plan.category);
}

function artistBlock(profile, artistName) {
  return `- Stage name: ${profile.stage_name || artistName}
- Genres: ${(profile.genres || []).join(', ') || 'unknown'}
- Based in: ${profile.city_state || 'unknown'}
- Career stage: ${profile.career_stage || 'unknown'}
- Sounds like: ${[profile.sounds_like_1, profile.sounds_like_2, profile.sounds_like_3].filter(Boolean).join(', ') || 'unknown'}`;
}

// Step 1: classify the task and plan the searches.
export async function planProspecting(base44, { task, profile, artistName, namedTargets }) {
  const year = new Date().getFullYear();
  const res = await withTimeout(base44.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt: `You are planning a research job for Sam, an AI music manager. Read the artist's task and decide what kind of outside targets (if any) Sam must find and contact.

TASK: "${task.prompt}"
NAMED TARGETS: ${namedTargets || 'none'}

ARTIST:
${artistBlock(profile, artistName)}

Return:
- category: "venue" (live venues / bookers), "label" (record labels), "distributor" (distribution or publishing-admin companies), "sync" (sync libraries, licensing, music supervisors), "playlist" (playlist curators), "press" (blogs, journalists, radio, podcasts), "other" (any other group of outside companies or people to contact), or "none" (no outside targets: a question, report analysis or calculation).
- target_count: how many targets the artist asked for if they gave a number; otherwise 20 for label/distributor/sync/playlist/press/other, 10 for venue, 0 for none.
- search_angles: for every category except venue and none, 5 to 6 DIFFERENT web search phrases that together surface a broad list of real candidates in ${year}. Vary them: by sub-genre, by region or city, by company size (small indie vs mid-size), by "accepting demo submissions / unsolicited submissions", by "labels that signed artists similar to" the sounds-like artists, and by roundup / directory / "best of" list articles. Each is a plain search phrase. Empty array for venue and none.`,
    response_json_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: CATEGORIES },
        target_count: { type: 'number' },
        search_angles: { type: 'array', items: { type: 'string' } },
      },
      required: ['category'],
    },
  }), 45000);

  const count = Math.round(Number(res?.target_count) || 0);
  return {
    category: CATEGORIES.includes(res?.category) ? res.category : 'none',
    target_count: Math.min(Math.max(count || 20, 1), 25),
    angles: (res?.search_angles || []).filter(a => typeof a === 'string' && a.trim()).slice(0, 6),
  };
}

function dedupeKey(c) {
  try {
    if (c.website) return new URL(c.website).hostname.replace(/^www\./, '').toLowerCase();
  } catch {}
  return String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Step 2: run every angle in parallel with live web search, then merge with the
// curated directory. Returns [{name, website, location, kind, note, from}].
export async function discoverTargets(base44, { plan, task, profile, artistName, namedTargets }) {
  const kindLabel = KIND_LABEL[plan.category] || KIND_LABEL.other;

  const runs = await Promise.allSettled(plan.angles.map(angle => withTimeout(
    base44.integrations.Core.InvokeLLM({
      model: MODEL,
      add_context_from_internet: true,
      prompt: `Search the web for: "${angle}"

You are finding real ${kindLabel} for an independent artist to contact.

ARTIST:
${artistBlock(profile, artistName)}

THE ARTIST'S TASK: "${task.prompt}"
NAMED TARGETS: ${namedTargets || 'none'}

Return up to 10 REAL, currently active ${kindLabel} that genuinely fit this artist's genre, size and career stage. Rules:
- Only include names you confirmed exist from search results. Never invent a name or a website.
- "website" is the official homepage URL.
- Skip defunct ones, and skip major-label imprints that do not take outside submissions unless the artist is already at that level.
- "submission_note": how they take new artists (open demo form, email, by referral only, unknown).`,
      response_json_schema: {
        type: 'object',
        properties: {
          candidates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                website: { type: 'string' },
                location: { type: 'string' },
                why_fit: { type: 'string' },
                submission_note: { type: 'string' },
              },
              required: ['name'],
            },
          },
        },
        required: ['candidates'],
      },
    }),
    80000,
  )));

  const found = [];
  runs.forEach((r, i) => {
    if (r.status !== 'fulfilled') {
      console.log(`samTaskRun discovery angle failed ("${plan.angles[i]}"):`, r.reason?.message || r.reason);
      return;
    }
    for (const c of r.value?.candidates || []) {
      if (!c?.name) continue;
      found.push({
        name: String(c.name).trim(),
        website: /^https?:\/\//.test(String(c.website || '')) ? String(c.website).trim() : '',
        location: String(c.location || ''),
        note: [c.why_fit, c.submission_note].filter(Boolean).join(' — '),
        from: 'web',
      });
    }
  });

  const genresText = `${(profile.genres || []).join(' ')} ${[profile.sounds_like_1, profile.sounds_like_2, profile.sounds_like_3].filter(Boolean).join(' ')} ${task.prompt || ''}`;

  // The shared company directory — artist corrections land here and outrank
  // everything else (they're the freshest, artist-verified facts).
  const records = await base44.entities.CompanyRecord.list('-updated_date', 300).catch(() => []);
  const recordEntries = records
    .filter(r => r.kind === plan.category && r.company_name)
    .map(r => ({
      name: r.company_name,
      website: r.website || '',
      location: r.location || '',
      note: [r.contact_email ? `contact: ${r.contact_email}` : '', r.submission_page ? `submissions: ${r.submission_page}` : '', r.notes].filter(Boolean).join(' — '),
      from: 'artist directory',
    }));

  const directory = matchCompanies(CURATED_COMPANIES, plan.category, genresText).map(c => ({
    name: c.name, website: c.website, location: c.location, note: c.notes, from: 'directory',
  }));

  const seen = new Set();
  const pool = [];
  for (const c of [...recordEntries, ...found, ...directory]) {
    const key = dedupeKey(c);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    pool.push(c);
  }
  return pool.slice(0, 60);
}

export function poolToLines(pool) {
  return pool.map(c =>
    `- ${c.name}${c.location ? ` (${c.location})` : ''}${c.website ? ` — ${c.website}` : ''}${c.note ? ` — ${c.note}` : ''}`
  );
}

// Website for a drafted target when the model left it blank.
export function siteForName(pool, name) {
  const n = String(name || '').toLowerCase().trim();
  if (!n) return '';
  const hit = pool.find(c => c.website && c.name.toLowerCase() === n)
    || pool.find(c => c.website && (n.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(n)));
  return hit?.website || '';
}