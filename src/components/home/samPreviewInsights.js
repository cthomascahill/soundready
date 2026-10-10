// Zero-cost rule engine: SAM-style suggestions derived only from the
// public numbers the search already returned. No AI call, no guessing —
// every line references a real stat the artist just saw.
// The pool holds 30+ variants and rotates per search so repeat lookups
// always surface a fresh insight instead of the same one.

const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

// Each template returns a string, or null when it doesn't apply to this artist.
const POOL = [
  // ---- Listener-to-follower conversion (needs followers) ----
  ({ listeners, followers, ratio }) =>
    followers > 0 && ratio >= 1.5
      ? `${compact(listeners)} people listen each month but only ${compact(followers)} follow you. That gap is your fastest win: converting casual listeners into followers makes the algorithm show your next release to people who already like you.`
      : null,
  ({ listeners, followers, ratio }) =>
    followers > 0 && ratio >= 1.5
      ? `For every follower you have, roughly ${ratio.toFixed(1)} people stream you monthly. Follower conversion is the cheapest growth lever you own right now — a follow-to-save loop on your profile would compound every future release.`
      : null,
  ({ listeners, followers, ratio }) =>
    followers > 0 && ratio >= 1.5
      ? `You reach ${compact(listeners)} listeners a month on a base of just ${compact(followers)} followers. That means most of your reach is algorithmic, not owned — one strong follow campaign stabilizes your floor.`
      : null,
  ({ listeners, followers, ratio }) =>
    followers > 0 && ratio >= 1.5
      ? `You reach ${compact(listeners)} listeners a month against ${compact(followers)} followers. Listeners and followers are counted separately, so some of that reach almost certainly isn't locked in yet — a follow prompt on your profile is the cheapest way to keep more of it for your next release.`
      : null,
  ({ listeners, followers, ratio }) =>
    followers > 0 && ratio >= 1.5
      ? `Your listener-to-follower ratio sits at ${ratio.toFixed(1)}:1 — for every follower you have, ${ratio.toFixed(1)} people stream you monthly. A listener who follows hears about your next release; a listener who doesn't may be gone next month. Turning more of the first group into the second is the cheapest retention you own.`
      : null,
  ({ listeners, followers }) =>
    followers > 0 && listeners > 0 && listeners / followers < 0.5
      ? `You have ${compact(followers)} followers but your monthly listeners sit at ${compact(listeners)}. Your core audience is bigger than your reach right now — a release cycle aimed at re-engaging followers is the play.`
      : null,
  ({ listeners, followers }) =>
    followers > 0 && listeners > 0 && listeners / followers < 0.5
      ? `${compact(followers)} followers, only ${compact(listeners)} monthly listeners: your catalog is sleeping. A re-engagement push — teaser, live version, or remix — wakes followers the algorithm forgot about.`
      : null,
  ({ listeners, followers }) =>
    followers > 0 && listeners > 0 && listeners / followers < 0.5
      ? `Your follower base of ${compact(followers)} is an underused asset: at typical rates it should drive far more than ${compact(listeners)} monthly listeners. Cheap wins live here before any new fans are found.`
      : null,
  ({ listeners, followers }) =>
    followers > 0 && listeners > 0 && listeners / followers >= 0.5 && listeners / followers < 1.5
      ? `Listeners and followers are nearly balanced (${compact(listeners)} vs ${compact(followers)}). You have a real core audience — the next move is widening reach, not deepening it.`
      : null,

  // ---- Discovery tier: under 10k ----
  ({ listeners, genre }) =>
    listeners > 0 && listeners < 10000
      ? `At ${compact(listeners)} monthly listeners you're in the discovery stage. Curated independent playlists in ${genre || "your genre"} are still reachable at this size — that door narrows fast as you grow, so pitch now.`
      : null,
  ({ listeners, genre }) =>
    listeners > 0 && listeners < 10000
      ? `${compact(listeners)} monthly listeners means playlist curators still read their own stats when they find you: this is when a single well-matched ${genre || "genre"} playlist can double your audience in one placement.`
      : null,
  ({ listeners }) =>
    listeners > 0 && listeners < 10000
      ? `Under 10k monthly listeners (${compact(listeners)} right now), every release is a data point. Two or three consistent drops a quarter teaches the algorithm who your audience is far faster than one big push.`
      : null,
  ({ listeners }) =>
    listeners > 0 && listeners < 10000
      ? `At ${compact(listeners)} listeners, your leverage isn't numbers — it's access. Small venues, local press and independent curators all still answer direct emails at this size. That window closes above 10k.`
      : null,
  ({ listeners, genre }) =>
    listeners > 0 && listeners < 10000
      ? `With ${compact(listeners)} monthly listeners, your best ROI move is depth: one tight ${genre || "scene"}, one city, one playlist ecosystem at a time. Artists who niche down here grow faster than those who spray.`
      : null,
  ({ listeners }) =>
    listeners > 0 && listeners < 10000
      ? `${compact(listeners)} monthly listeners is exactly the size where SAM's research matters most: hundreds of small playlists fit you, and nobody can email them all by hand.`
      : null,

  // ---- Rising tier: 10k-100k ----
  ({ listeners, genre }) =>
    listeners >= 10000 && listeners < 100000
      ? `Crossing ${compact(listeners)} monthly listeners puts you on playlists' and venues' radar. This is the tier where an opening slot for a touring ${genre || "similar"} act becomes a realistic ask.`
      : null,
  ({ listeners }) =>
    listeners >= 10000 && listeners < 100000
      ? `At ${compact(listeners)} monthly listeners you're out of the hardest zone. The next lever is consistency of release cadence — the algorithm rewards artists who show up every 6-8 weeks at your size.`
      : null,
  ({ listeners, genre }) =>
    listeners >= 10000 && listeners < 100000
      ? `${compact(listeners)} monthly listeners is the tier where sync supervisors start filtering searches by genre. A clean, current ${genre || "genre"} pitch sheet is what turns you from a search result into a placement.`
      : null,
  ({ listeners }) =>
    listeners >= 10000 && listeners < 100000
      ? `With ${compact(listeners)} listeners, your audience is big enough to test touring: one regional run of 3-5 dates within driving distance of your top markets usually pays for itself at this size.`
      : null,
  ({ listeners }) =>
    listeners >= 10000 && listeners < 100000
      ? `At ${compact(listeners)} monthly listeners you have enough signal for real decisions: which songs to push, which cities to book, which curators to chase. Guesswork should be over at your size.`
      : null,
  ({ listeners, genre }) =>
    listeners >= 10000 && listeners < 100000
      ? `${compact(listeners)} monthly listeners puts you in the strongest playlisting window of your career — mid-size ${genre || "genre"} lists actively need artists at your numbers to keep their own stats healthy.`
      : null,

  // ---- Established tier: 100k-1M ----
  ({ listeners }) =>
    listeners >= 100000 && listeners < 1000000
      ? `With ${compact(listeners)} monthly listeners you're past the hardest threshold. Labels and sync libraries start reading your numbers as leverage — this is when deal terms matter more than getting any deal.`
      : null,
  ({ listeners }) =>
    listeners >= 100000 && listeners < 1000000
      ? `At ${compact(listeners)} monthly listeners, your catalog is an asset: publishing and sync valuations key off your stream consistency now, not just your peaks.`
      : null,
  ({ listeners }) =>
    listeners >= 100000 && listeners < 1000000
      ? `${compact(listeners)} listeners means your release strategy is now a portfolio question: which track gets the push, which gets the video budget, which one stays a fan-deep cut.`
      : null,
  ({ listeners }) =>
    listeners >= 100000 && listeners < 1000000
      ? `With ${compact(listeners)} monthly listeners, booking leverage flips: venues now compete for you. Holding out for better guarantees beats accepting the first offer that matches your ego.`
      : null,
  ({ listeners }) =>
    listeners >= 100000 && listeners < 1000000
      ? `At ${compact(listeners)} listeners, the wins stop being creative and start being structural: splits, publishing admin, and a tour P&L are what decide whether this tier pays you or just flatters you.`
      : null,

  // ---- Major tier: 1M+ ----
  ({ listeners }) =>
    listeners >= 1000000
      ? `At ${compact(listeners)} monthly listeners your problem isn't reach, it's structure: touring routes, release cadence and deal terms are where the money is won or lost at your size.`
      : null,
  ({ listeners }) =>
    listeners >= 1000000
      ? `${compact(listeners)} monthly listeners makes you a business. Catalog valuation, publishing buyouts and brand deals are all live options now — the order you take them in changes your outcome permanently.`
      : null,
  ({ listeners }) =>
    listeners >= 1000000
      ? `With ${compact(listeners)} listeners, protection beats promotion: audit your splits, registrations and royalty flows before you chase the next spike. Leaks cost more than ads at your size.`
      : null,

  // ---- Genre angle ----
  ({ genre, name }) =>
    genre
      ? `As a ${genre} artist, your closest comparable acts are already being pitched to the same curators. SAM researches which playlist ecosystems match ${genre} and drafts the outreach for you.`
      : null,
  ({ genre, listeners }) =>
    genre
      ? `The ${genre} playlist ecosystem is crowded, but it's also unusually well-mapped: SAM can rank which curators actually move numbers for an artist at ${compact(listeners)} listeners and start there.`
      : null,
  ({ genre }) =>
    genre
      ? `${genre} audiences over-index on live shows and social clips over algorithmic discovery — your release plan should treat every drop as content fuel, not just a stream play.`
      : null,

  // ---- Evergreen (always apply) ----
  ({ name }) =>
    `SAM reads your real numbers every week and turns them into actions: playlist pitches, venue outreach and label research, each drafted and waiting for your approval.`,
  ({ name }) =>
    `Every opportunity SAM finds for ${name} comes with a ready-to-send email, personalized with your actual stats. Nothing sends without your OK.`,
  ({ name, listeners }) =>
    `Most artists at ${compact(listeners)} monthly listeners lose months to busywork — finding contacts, writing cold emails, tracking who replied. That entire layer is what SAM takes over.`,
  ({ name }) =>
    `${name}'s next 90 days can be pre-built: which playlists to pitch, which venues to email, which releases to schedule. SAM plans it weekly and executes what you approve.`,
  ({ listeners }) =>
    `Numbers like ${compact(listeners)} monthly listeners change weekly. SAM watches the trend line — not the snapshot — and moves when your momentum moves.`,
  ({ name }) =>
    `SAM builds a running file on ${name}: what worked, what flopped, which curators replied. Every outreach gets smarter than the last one.`,
];

export function buildSamSuggestions({ name, monthly_listeners, followers, genre }, offset = 0) {
  const listeners = monthly_listeners || 0;
  const ratio = listeners / Math.max(followers, 1);
  const ctx = { name, listeners, followers, ratio, genre };

  const applicable = POOL.map((fn) => fn(ctx)).filter(Boolean);

  // Rotate the pool so each new search surfaces fresh insights,
  // cycling through everything before repeating.
  const start = applicable.length ? offset % applicable.length : 0;
  const rotated = [...applicable.slice(start), ...applicable.slice(0, start)];

  return rotated.slice(0, 4);
}