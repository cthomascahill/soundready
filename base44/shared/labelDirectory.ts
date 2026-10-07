// Curated seed of real independent labels, distributors and sync companies Sam
// researches against when the artist asks for record labels, distribution or
// licensing. These are LEADS, not verified facts: Sam checks each one live
// before drafting. Genre tags: hip hop, r&b, indie, rock, punk, metal,
// electronic, folk, jazz, pop, latin, any.

const L = (name, website, genres, location, notes) => ({ name, kind: 'label', website, genres, location, notes });
const D = (name, website, notes) => ({ name, kind: 'distributor', website, genres: ['any'], location: '', notes });
const S = (name, website, notes) => ({ name, kind: 'sync', website, genres: ['any'], location: '', notes });

export const CURATED_COMPANIES = [
  // ── Labels: hip hop / r&b / soul ──
  L('Rhymesayers Entertainment', 'https://rhymesayers.com', ['hip hop'], 'Minneapolis, MN', 'Independent hip hop institution.'),
  L('Stones Throw Records', 'https://stonesthrow.com', ['hip hop', 'r&b', 'electronic'], 'Los Angeles, CA', 'Left-field hip hop, soul and beats.'),
  L('Mello Music Group', 'https://mellomusicgroup.com', ['hip hop'], 'Brooklyn, NY', 'Boutique indie hip hop label.'),
  L('Strange Music', 'https://strangemusicinc.com', ['hip hop'], 'Kansas City, MO', 'Fully independent, artist-owned model.'),
  L('Doomtree Records', 'https://doomtree.net', ['hip hop'], 'Minneapolis, MN', 'Collective-run indie hip hop label.'),
  L('Duck Down Music', 'https://duckdown.com', ['hip hop'], 'Brooklyn, NY', 'Long-running independent hip hop label.'),
  L('Backwoodz Studioz', 'https://backwoodzstudioz.com', ['hip hop'], 'New York, NY', 'Underground NYC hip hop label.'),
  L('Brainfeeder', 'https://brainfeeder.net', ['hip hop', 'electronic', 'jazz'], 'Los Angeles, CA', 'Beat-driven, jazz-leaning experimental label.'),
  L('Tommy Boy Records', 'https://tommyboy.com', ['hip hop', 'electronic', 'pop'], 'New York, NY', 'Legacy independent label.'),
  L('Daptone Records', 'https://daptonerecords.com', ['r&b', 'jazz'], 'Brooklyn, NY', 'Retro soul and funk.'),
  L('Colemine Records', 'https://coleminerecords.com', ['r&b', 'jazz'], 'Loveland, OH', 'Modern soul and funk.'),
  L('Big Crown Records', 'https://bigcrownrecords.com', ['r&b', 'hip hop'], 'New York, NY', 'Soul and hip hop.'),
  L('Ropeadope', 'https://ropeadope.com', ['jazz', 'hip hop', 'r&b'], 'Pittsburgh, PA', 'Jazz-fusion and genre-blending artists.'),
  L('EMPIRE', 'https://empi.re', ['hip hop', 'r&b', 'pop', 'latin'], 'San Francisco, CA', 'Independent label and distributor.'),
  L('Rimas Entertainment', 'https://rimasent.com', ['latin', 'hip hop'], 'Puerto Rico', 'Independent Latin label.'),
  // ── Labels: indie / rock / alternative ──
  L('Sub Pop', 'https://subpop.com', ['indie', 'rock'], 'Seattle, WA', 'Flagship indie rock label.'),
  L('Merge Records', 'https://mergerecords.com', ['indie', 'rock'], 'Durham, NC', 'Artist-founded indie.'),
  L('Matador Records', 'https://matadorrecords.com', ['indie', 'rock'], 'New York, NY', 'Indie rock institution.'),
  L('Dead Oceans', 'https://deadoceans.com', ['indie', 'folk'], 'Bloomington, IN', 'Indie, part of Secretly Group.'),
  L('Jagjaguwar', 'https://jagjaguwar.com', ['indie', 'folk', 'rock'], 'Bloomington, IN', 'Indie, part of Secretly Group.'),
  L('Secretly Canadian', 'https://secretlycanadian.com', ['indie', 'electronic'], 'Bloomington, IN', 'Indie, part of Secretly Group.'),
  L('Saddle Creek', 'https://saddle-creek.com', ['indie', 'rock', 'folk'], 'Omaha, NE', 'Indie rock and folk.'),
  L('Barsuk Records', 'https://barsuk.com', ['indie', 'rock', 'pop'], 'Seattle, WA', 'Indie rock and pop.'),
  L('Polyvinyl Record Co.', 'https://polyvinylrecords.com', ['indie', 'rock', 'punk'], 'Champaign, IL', 'Indie and emo-leaning rock.'),
  L('Western Vinyl', 'https://westernvinyl.com', ['indie', 'electronic', 'folk'], 'Austin, TX', 'Experimental indie.'),
  L('Hardly Art', 'https://hardlyart.com', ['indie', 'rock'], 'Seattle, WA', 'Sub Pop sister label for younger bands.'),
  L('Kill Rock Stars', 'https://killrockstars.com', ['indie', 'punk', 'rock'], 'Olympia, WA', 'Indie and punk-leaning.'),
  L('Dangerbird Records', 'https://dangerbirdrecords.com', ['indie', 'rock', 'pop'], 'Los Angeles, CA', 'Independent LA label.'),
  L('Mom + Pop Music', 'https://momandpop.com', ['indie', 'pop', 'rock'], 'New York, NY', 'Independent pop and indie.'),
  L('ANTI- Records', 'https://anti.com', ['indie', 'folk', 'rock', 'hip hop'], 'Los Angeles, CA', 'Eclectic independent label.'),
  L('Sargent House', 'https://sargenthouse.com', ['indie', 'rock', 'metal'], 'Los Angeles, CA', 'Label and management company.'),
  L('Fat Possum Records', 'https://fatpossum.com', ['indie', 'rock', 'folk'], 'Oxford, MS', 'Indie rock and blues-rooted.'),
  L('Captured Tracks', 'https://capturedtracks.com', ['indie', 'rock'], 'Brooklyn, NY', 'Dream pop and indie.'),
  L('Run For Cover Records', 'https://runforcoverrecords.com', ['indie', 'punk', 'rock'], 'Boston, MA', 'Indie, emo and punk.'),
  L('Domino Recording Co.', 'https://dominorecordco.com', ['indie', 'rock', 'electronic'], 'New York, NY', 'Independent with a US office.'),
  L('4AD', 'https://4ad.com', ['indie', 'electronic', 'rock'], 'London, UK', 'Landmark independent label.'),
  L('Rough Trade Records', 'https://roughtraderecords.com', ['indie', 'rock'], 'London, UK', 'Independent label and record shops.'),
  // ── Labels: punk / emo / metal ──
  L('Epitaph Records', 'https://epitaph.com', ['punk', 'rock', 'indie'], 'Los Angeles, CA', 'Punk and alternative independent.'),
  L('Fat Wreck Chords', 'https://fatwreck.com', ['punk'], 'San Francisco, CA', 'Punk independent.'),
  L('Hopeless Records', 'https://hopelessrecords.com', ['punk', 'rock', 'pop'], 'Van Nuys, CA', 'Pop-punk and emo.'),
  L('Pure Noise Records', 'https://purenoiserecords.com', ['punk', 'rock'], 'Fullerton, CA', 'Pop-punk, emo and hardcore.'),
  L('Rise Records', 'https://riserecords.com', ['punk', 'rock', 'metal'], 'Portland, OR', 'Post-hardcore and alternative.'),
  L('Equal Vision Records', 'https://equalvision.com', ['punk', 'rock'], 'Albany, NY', 'Emo and post-hardcore.'),
  L('SideOneDummy Records', 'https://sideonedummy.com', ['punk', 'rock', 'folk'], 'Los Angeles, CA', 'Punk and folk-punk.'),
  L('No Sleep Records', 'https://nosleeprecords.com', ['punk', 'rock'], 'Fort Lauderdale, FL', 'Emo and pop-punk.'),
  L('Deathwish Inc.', 'https://deathwishinc.com', ['punk', 'metal'], 'Salem, MA', 'Hardcore and heavy music.'),
  L('Relapse Records', 'https://relapse.com', ['metal'], 'Philadelphia, PA', 'Extreme metal.'),
  L('Metal Blade Records', 'https://metalblade.com', ['metal'], 'Los Angeles, CA', 'Long-running metal independent.'),
  L('Prosthetic Records', 'https://prostheticrecords.com', ['metal'], 'Los Angeles, CA', 'Metal and heavy independent.'),
  // ── Labels: electronic ──
  L('Monstercat', 'https://monstercat.com', ['electronic'], 'Vancouver, Canada', 'Electronic, submissions via their site.'),
  L('Anjunabeats', 'https://anjunabeats.com', ['electronic'], 'London, UK', 'Progressive and trance.'),
  L('Anjunadeep', 'https://anjunadeep.com', ['electronic'], 'London, UK', 'Deep house and melodic electronic.'),
  L('Ninja Tune', 'https://ninjatune.net', ['electronic', 'hip hop', 'jazz'], 'London, UK', 'Genre-blending electronic.'),
  L('Warp Records', 'https://warp.net', ['electronic'], 'London, UK', 'Experimental electronic.'),
  L('mau5trap', 'https://mau5trap.com', ['electronic'], 'Toronto, Canada', 'Electronic label.'),
  L('OWSLA', 'https://owsla.com', ['electronic'], 'Los Angeles, CA', 'Bass and dance music.'),
  L('Dim Mak Records', 'https://dimmak.com', ['electronic'], 'Los Angeles, CA', 'Dance and electronic.'),
  L('Ghostly International', 'https://ghostly.com', ['electronic', 'indie'], 'Ann Arbor, MI', 'Electronic and experimental.'),
  L('Kompakt', 'https://kompakt.fm', ['electronic'], 'Cologne, Germany', 'Techno and ambient.'),
  L('Hospital Records', 'https://hospitalrecords.com', ['electronic'], 'London, UK', 'Drum and bass.'),
  L('Spinnin\' Records', 'https://spinninrecords.com', ['electronic'], 'Hilversum, Netherlands', 'Dance and EDM.'),
  // ── Labels: folk / country / americana ──
  L('Rounder Records', 'https://rounder.com', ['folk'], 'Burlington, MA', 'Roots and Americana.'),
  L('New West Records', 'https://newwestrecords.com', ['folk', 'rock'], 'Nashville, TN', 'Americana and roots rock.'),
  L('ATO Records', 'https://atorecords.com', ['folk', 'rock', 'indie'], 'Brooklyn, NY', 'Rock and Americana.'),
  L('Bloodshot Records', 'https://bloodshotrecords.com', ['folk', 'rock'], 'Chicago, IL', 'Alt-country and roots.'),
  L('Thirty Tigers', 'https://thirtytigers.com', ['folk', 'rock', 'pop'], 'Nashville, TN', 'Artist services and label.'),
  L('Compass Records', 'https://compassrecords.com', ['folk'], 'Nashville, TN', 'Roots and acoustic.'),
  L('Sugar Hill Records', 'https://sugarhillrecords.com', ['folk'], 'Durham, NC', 'Bluegrass and Americana.'),
  L('Yep Roc Records', 'https://yeproc.com', ['folk', 'rock', 'indie'], 'Hillsborough, NC', 'Americana and indie.'),
  L('Dirty Hit', 'https://dirtyhit.co.uk', ['indie', 'pop', 'rock'], 'London, UK', 'Indie pop and alternative.'),
  L('Create Music Group', 'https://createmusicgroup.com', ['any'], 'Los Angeles, CA', 'Label services across genres.'),

  // ── Distributors ──
  D('DistroKid', 'https://distrokid.com', 'DIY distribution, flat annual fee.'),
  D('TuneCore', 'https://tunecore.com', 'DIY distribution and publishing admin.'),
  D('CD Baby', 'https://cdbaby.com', 'DIY distribution and sync licensing.'),
  D('AWAL', 'https://awal.com', 'Curated distribution with label-like services.'),
  D('UnitedMasters', 'https://unitedmasters.com', 'Artist-owned distribution, brand deals.'),
  D('Ditto Music', 'https://dittomusic.com', 'DIY distribution.'),
  D('Amuse', 'https://amuse.io', 'Distribution with a label-services tier.'),
  D('Symphonic Distribution', 'https://symphonicdistribution.com', 'Distribution with marketing support.'),
  D('ONErpm', 'https://onerpm.com', 'Distribution and label services.'),
  D('The Orchard', 'https://theorchard.com', 'Label/artist distribution, invite-oriented.'),
  D('Stem', 'https://stem.is', 'Distribution with automatic revenue splits.'),
  D('RouteNote', 'https://routenote.com', 'Free distribution tier.'),
  D('LANDR', 'https://landr.com', 'Distribution plus mastering.'),
  D('Too Lost', 'https://toolost.com', 'DIY distribution.'),
  D('Vydia', 'https://vydia.com', 'Distribution and video monetization.'),
  D('iMusician', 'https://imusiciandigital.com', 'DIY distribution.'),
  D('Record Union', 'https://recordunion.com', 'DIY distribution.'),
  D('FUGA', 'https://fuga.com', 'Distribution platform for labels.'),
  D('Redeye Worldwide', 'https://redeyeworldwide.com', 'Independent label distribution.'),
  D('Virgin Music Group', 'https://virginmusicgroup.com', 'Distribution for independent labels and artists.'),

  // ── Sync / licensing ──
  S('Musicbed', 'https://musicbed.com', 'Curated licensing for film and ads.'),
  S('Artlist', 'https://artlist.io', 'Music licensing for creators, artist applications.'),
  S('Epidemic Sound', 'https://epidemicsound.com', 'Royalty-free library for creators.'),
  S('Marmoset', 'https://marmosetmusic.com', 'Indie sync agency.'),
  S('Songtradr', 'https://songtradr.com', 'Sync marketplace.'),
  S('Soundstripe', 'https://soundstripe.com', 'Creator-focused music licensing.'),
  S('Audio Network', 'https://audionetwork.com', 'Production music library.'),
  S('APM Music', 'https://apmmusic.com', 'Production music for TV and film.'),
  S('Position Music', 'https://positionmusic.com', 'Sync licensing for TV, film, ads.'),
  S('Extreme Music', 'https://extrememusic.com', 'Production music library.'),
  S('Pond5', 'https://pond5.com', 'Stock media and music licensing.'),
  S('Music Gateway', 'https://musicgateway.com', 'Sync and licensing services.'),
  S('Terrorbird Media', 'https://terrorbird.com', 'Independent sync agency.'),
  S('Sentric Music', 'https://sentricmusic.com', 'Publishing and sync.'),
  S('Lickd', 'https://lickd.co', 'Licensing for YouTube creators.'),
  S('TAXI', 'https://taxi.com', 'Independent A&R listing service for film/TV/labels.'),
];

const GENRE_KEYWORDS = {
  'hip hop': ['hip hop', 'hip-hop', 'hiphop', 'rap', 'trap', 'boom bap', 'drill'],
  'r&b': ['r&b', 'rnb', 'soul', 'neo-soul', 'neo soul'],
  indie: ['indie', 'alternative', 'alt', 'bedroom', 'lo-fi', 'lofi', 'dream pop', 'shoegaze', 'art pop'],
  rock: ['rock', 'garage', 'grunge', 'psych', 'psychedelic'],
  punk: ['punk', 'emo', 'hardcore', 'pop-punk', 'pop punk', 'post-hardcore', 'screamo'],
  metal: ['metal', 'doom', 'sludge', 'thrash'],
  electronic: ['electronic', 'edm', 'house', 'techno', 'trance', 'dubstep', 'dnb', 'drum and bass', 'synth', 'dance', 'ambient'],
  folk: ['folk', 'singer-songwriter', 'singer songwriter', 'acoustic', 'americana', 'country', 'bluegrass', 'roots'],
  jazz: ['jazz', 'funk', 'fusion'],
  pop: ['pop'],
  latin: ['latin', 'reggaeton', 'latino', 'urbano', 'salsa', 'bachata'],
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Which genre tags the artist's genres / task text point to.
export function genreTagsFor(text) {
  const t = String(text || '').toLowerCase();
  const tags = [];
  for (const [tag, words] of Object.entries(GENRE_KEYWORDS)) {
    if (words.some(w => new RegExp(`(^|[^a-z0-9])${escapeRe(w)}([^a-z0-9]|$)`).test(t))) tags.push(tag);
  }
  return tags;
}

// Directory companies of the requested kind, best genre fit first.
// category: 'label' | 'distributor' | 'sync' — anything else returns [].
export function matchCompanies(all, category, genresText) {
  if (!['label', 'distributor', 'sync'].includes(category)) return [];
  const pool = (all || []).filter(c => c.kind === category);
  if (category !== 'label') return pool;
  const artistTags = genreTagsFor(genresText);
  const wanted = artistTags.length ? artistTags : ['indie'];
  return pool
    .map(c => {
      const overlap = c.genres.filter(g => wanted.includes(g)).length;
      return { c, score: overlap + (c.genres.includes('any') ? 0.5 : 0) };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map(x => x.c);
}