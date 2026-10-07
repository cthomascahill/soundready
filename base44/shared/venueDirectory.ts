// Curated fallback of iconic small/independent venues Sam researches against.
// The living directory lives in the VenueRecord entity (artists' corrections
// land there); this seed guarantees strong baseline coverage in key cities.

export const CURATED_VENUES = [
  // ── Chicago ──
  { name: "Burlington Bar", city: "Chicago", state: "IL", capacity: 100, website: "https://www.burlingtonbar.com", notes: "Logan Square dive, cornerstone of Chicago's underground rap and DIY scene." },
  { name: "Schubas Tavern", city: "Chicago", state: "IL", capacity: 165, website: "https://www.lh-st.com/schubas", notes: "Classic small room in Lakeview, legendary for breaking new acts." },
  { name: "Beat Kitchen", city: "Chicago", state: "IL", capacity: 150, website: "https://www.beatkitchen.com", notes: "Roscoe Village staple for indie and hip hop showcases." },
  { name: "Empty Bottle", city: "Chicago", state: "IL", capacity: 150, website: "https://www.emptybottle.com", notes: "Legendary Ukrainian Village dive for indie, experimental and rap bills." },
  // ── Denver ──
  { name: "Lost Lake", city: "Denver", state: "CO", capacity: 100, website: "https://www.lostlakedenver.com", notes: "Tiny DIY venue on East Colfax; a rite of passage for touring acts." },
  { name: "Goosetown Tavern", city: "Denver", state: "CO", capacity: 150, website: "https://www.goosetowntavern.com", notes: "Capitol Hill dive bar with a back-room stage; local-heavy bills." },
  { name: "Hi-Dive", city: "Denver", state: "CO", capacity: 150, website: "https://www.hi-dive.com", notes: "South Broadway indie/rock staple, national acts play small here." },
  { name: "Larimer Lounge", city: "Denver", state: "CO", capacity: 150, website: "https://www.larimerlounge.com", notes: "RiNo dive that helped break countless indie bands." },
  // ── New York ──
  { name: "Baby's All Right", city: "Brooklyn", state: "NY", capacity: 250, website: "https://www.babysallright.com", notes: "Williamsburg staple for indie touring acts." },
  { name: "Gold Sounds", city: "Brooklyn", state: "NY", capacity: 100, website: "https://www.goldsoundsbar.com", notes: "Park Slope small room, hip hop and indie bills." },
  { name: "Pianos", city: "New York", state: "NY", capacity: 150, website: "https://www.pianosnyc.com", notes: "Lower East Side room, late showcases all week." },
  // ── Los Angeles ──
  { name: "The Echo", city: "Los Angeles", state: "CA", capacity: 200, website: "https://www.echoplexla.com", notes: "Echo Park institution for breaking indie acts." },
  { name: "The Smell", city: "Los Angeles", state: "CA", capacity: 150, website: "https://www.thesmell.org", notes: "All-ages DIY downtown institution." },
  // ── Austin ──
  { name: "Mohawk", city: "Austin", state: "TX", capacity: 300, website: "https://www.mohawkaustin.com", notes: "Indie venue on Red River Street." },
  { name: "Hotel Vegas", city: "Austin", state: "TX", capacity: 200, website: "https://www.hotelvegasaustin.com", notes: "East Austin dive with a big yard stage." },
  // ── Nashville ──
  { name: "The Basement East", city: "Nashville", state: "TN", capacity: 500, website: "https://www.thebasementeast.com", notes: "East Nashville's indie/rock room." },
  // ── Atlanta ──
  { name: "The Earl", city: "Atlanta", state: "GA", capacity: 250, website: "https://www.badearl.com", notes: "East Atlanta Village staple for touring indie acts." },
  // ── Philadelphia ──
  { name: "Johnny Brenda's", city: "Philadelphia", state: "PA", capacity: 250, website: "https://www.johnnybrendas.com", notes: "Fishtown corner bar with an upstairs stage." },
  // ── Boston ──
  { name: "Great Scott", city: "Allston", state: "MA", capacity: 220, website: "https://www.greatscottboston.com", notes: "Where national indie acts play small on the way up." },
  { name: "Middle East Corner", city: "Cambridge", state: "MA", capacity: 200, website: "https://www.mideastoffers.com", notes: "The small corner room of the Middle East complex." },
  // ── Seattle / Portland ──
  { name: "Neumos", city: "Seattle", state: "WA", capacity: 500, website: "https://www.neumos.com", notes: "Capitol Hill club, Crucial Noise upstairs." },
  { name: "Holocene", city: "Portland", state: "OR", capacity: 300, website: "https://www.holocene.org", notes: "Southeast Portland electronic/indie club." },
  // ── Detroit / Cleveland / Minneapolis ──
  { name: "The Loving Touch", city: "Ferndale", state: "MI", capacity: 250, website: "https://www.thelovingtouchdetroit.com", notes: "Metro Detroit indie bar venue." },
  { name: "Grog Shop", city: "Cleveland Heights", state: "OH", capacity: 250, website: "https://www.grogshop.gs", notes: "Cleveland's long-running small touring room." },
  { name: "331 Club", city: "Minneapolis", state: "MN", capacity: 100, website: "https://www.331club.com", notes: "Northeast Minneapolis dive next to Nye's; tiny stage, real scene." },
];

// Returns venues whose name or city is mentioned anywhere in the text.
export function matchVenuesForText(allVenues, text) {
  const t = String(text || '').toLowerCase();
  if (!t) return [];
  return (allVenues || []).filter(v => {
    if (!v || !v.name || !v.city) return false;
    return t.includes(String(v.city).toLowerCase()) || t.includes(String(v.name).toLowerCase());
  });
}