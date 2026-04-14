import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { MapPin, Music, DollarSign, Calendar, Send, Check, ExternalLink, Search, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VENUE_DB = [
  // Northeast
  { name: "Mercury Lounge", city: "New York, NY", capacity: 250, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$150-$400", booking_email: "booking@mercuryloungenyc.com", type: "Club", website: "https://www.mercuryloungenyc.com", notes: "Iconic NYC indie venue. Submit EPK + streaming links." },
  { name: "Baby's All Right", city: "Brooklyn, NY", capacity: 400, genres: ["Indie", "Pop", "R&B", "Hip Hop"], pay: "$200-$600", booking_email: "booking@babysallright.com", type: "Bar/Venue", website: "https://www.babysallright.com", notes: "Trendy Brooklyn spot. Strong social following helps." },
  { name: "The Knitting Factory", city: "Brooklyn, NY", capacity: 350, genres: ["Hip Hop", "Indie", "Rock", "EDM"], pay: "$100-$300", booking_email: "info@knittingfactory.com", type: "Club", website: "https://www.knittingfactory.com", notes: "Great for emerging acts. Book 6-8 weeks in advance." },
  { name: "Great Scott", city: "Boston, MA", capacity: 200, genres: ["Rock", "Indie", "Pop"], pay: "$100-$300", booking_email: "booking@greatscottboston.com", type: "Bar/Venue", website: "https://www.greatscottboston.com", notes: "Boston indie institution. Email EPK with streaming link." },
  { name: "The Paradise Rock Club", city: "Boston, MA", capacity: 650, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@thedise.com", type: "Concert Hall", website: "https://www.thedise.com", notes: "Mid-size venue. Need proven draw in Boston market." },
  { name: "Underground Arts", city: "Philadelphia, PA", capacity: 600, genres: ["Indie", "Rock", "Hip Hop", "EDM"], pay: "$200-$700", booking_email: "bookings@undergroundarts.net", type: "Arts Venue", website: "https://www.undergroundarts.net", notes: "Flexible venue for all genres. Active booking team." },

  // Southeast
  { name: "The Masquerade", city: "Atlanta, GA", capacity: 1000, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$300-$1500", booking_email: "booking@masqueradeatlanta.com", type: "Concert Hall", website: "https://www.masqueradeatlanta.com", notes: "Multi-room venue. Heaven, Hell, and Purgatory stages." },
  { name: "The Basement", city: "Nashville, TN", capacity: 150, genres: ["Country", "Indie", "Rock", "Pop"], pay: "$100-$400", booking_email: "info@thebasementnashville.com", type: "Club", website: "https://www.thebasementnashville.com", notes: "Legendary Nashville venue. Submit EPK via website." },
  { name: "Exit/In", city: "Nashville, TN", capacity: 500, genres: ["Country", "Rock", "Indie", "Pop"], pay: "$200-$800", booking_email: "booking@exitin.com", type: "Concert Hall", website: "https://www.exitin.com", notes: "Historic Nashville club. Great for singer-songwriters." },
  { name: "The Social", city: "Orlando, FL", capacity: 300, genres: ["Indie", "Pop", "Rock", "Hip Hop"], pay: "$150-$400", booking_email: "booking@thesocial.org", type: "Club", website: "https://www.thesocial.org", notes: "Central Florida's indie hub. Active all-ages shows." },
  { name: "The Handlebar", city: "Greenville, SC", capacity: 200, genres: ["Country", "Indie", "Rock"], pay: "$100-$300", booking_email: "booking@handlebar-online.com", type: "Bar/Venue", website: "https://www.handlebar-online.com", notes: "Music-forward bar. Sunday showcases for emerging acts." },

  // Midwest
  { name: "Schubas Tavern", city: "Chicago, IL", capacity: 200, genres: ["Indie", "Pop", "Country", "R&B"], pay: "$150-$400", booking_email: "booking@schubas.com", type: "Bar/Venue", website: "https://www.schubas.com", notes: "Intimate Chicago venue with strong reputation for emerging acts." },
  { name: "The Empty Bottle", city: "Chicago, IL", capacity: 350, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$100-$350", booking_email: "booking@emptybottle.com", type: "Bar/Venue", website: "https://www.emptybottle.com", notes: "Indie rock staple. DYI ethic, artist-friendly." },
  { name: "7th Street Entry", city: "Minneapolis, MN", capacity: 250, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$150-$500", booking_email: "booking@firstave.com", type: "Club", website: "https://www.first-avenue.com", notes: "Sibling venue to First Avenue. Great room for emerging acts." },
  { name: "The Beachland Ballroom", city: "Cleveland, OH", capacity: 500, genres: ["Indie", "Rock", "Country", "Hip Hop"], pay: "$200-$700", booking_email: "booking@beachlandballroom.com", type: "Concert Hall", website: "https://www.beachlandballroom.com", notes: "Historic venue with two rooms. Very artist-friendly." },

  // West Coast
  { name: "The Troubadour", city: "Los Angeles, CA", capacity: 400, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$300-$1200", booking_email: "booking@troubadour.com", type: "Concert Hall", website: "https://www.troubadour.com", notes: "Legendary LA venue. Need strong draw or label support." },
  { name: "The Echo", city: "Los Angeles, CA", capacity: 350, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$200-$700", booking_email: "booking@attheecho.com", type: "Club", website: "https://www.attheecho.com", notes: "Great mid-size LA venue. Diverse genre booking." },
  { name: "Bottom of the Hill", city: "San Francisco, CA", capacity: 350, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$150-$500", booking_email: "booking@bottomofthehill.com", type: "Bar/Venue", website: "https://www.bottomofthehill.com", notes: "Bay Area indie institution. Very indie artist friendly." },
  { name: "Neumos", city: "Seattle, WA", capacity: 650, genres: ["Indie", "Rock", "EDM", "Hip Hop"], pay: "$250-$900", booking_email: "booking@neumos.com", type: "Concert Hall", website: "https://www.neumos.com", notes: "Seattle's top indie venue. Submit EPK with streaming numbers." },
  { name: "Mississippi Studios", city: "Portland, OR", capacity: 300, genres: ["Indie", "Rock", "Country", "Pop"], pay: "$150-$500", booking_email: "booking@mississippistudios.com", type: "Club", website: "https://www.mississippistudios.com", notes: "Beautiful PDX venue. Artist-first booking philosophy." },

  // Texas
  { name: "Stubb's Waller Creek Amphitheater", city: "Austin, TX", capacity: 2750, genres: ["All"], pay: "$1000+", booking_email: "booking@stubbsaustin.com", type: "Amphitheater", website: "https://www.stubbsaustin.com", notes: "Iconic Austin outdoor venue. Requires established draw." },
  { name: "The Parish", city: "Austin, TX", capacity: 600, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@austincitylimits.com", type: "Concert Hall", website: "https://www.theparishaustin.com", notes: "ACL Live's sister venue. Great for emerging acts." },
  { name: "White Oak Music Hall", city: "Houston, TX", capacity: 1500, genres: ["All"], pay: "$500-$2000", booking_email: "booking@whiteoakmusichall.com", type: "Concert Hall", website: "https://www.whiteoakmusichall.com", notes: "Three stages. Lots of indie bookings for smaller shows." },
];

const BOOKING_RESOURCES = [
  { name: "Indie on the Move", url: "https://www.indieonthemove.com", desc: "The gold standard for DIY touring. Searchable venue database, booking contacts, and tour routing tools.", icon: "🗺️" },
  { name: "Sonicbids", url: "https://www.sonicbids.com", desc: "EPK platform connecting artists to venues and festivals worldwide. Submit your EPK once, apply to hundreds of gigs.", icon: "📁" },
  { name: "GigSalad", url: "https://www.gigsalad.com", desc: "Book private events, corporate gigs, weddings, and parties. Great for supplemental income.", icon: "🎉" },
  { name: "ReverbNation", url: "https://www.reverbnation.com", desc: "Venue showcase opportunities and promoter connections. Good for building early touring history.", icon: "🎸" },
  { name: "SubmitHub (Live)", url: "https://www.submithub.com", desc: "Not just for playlists — some curators also book shows and live sessions.", icon: "📨" },
  { name: "Bandsintown for Artists", url: "https://artists.bandsintown.com", desc: "Announce shows and reach fans. Also connects you with promoters in your area.", icon: "📍" },
];

function EPKModal({ venue, artist, onClose }) {
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, professional booking inquiry email from artist "${artist.name}" to the booking team at "${venue.name}" in ${venue.city}.

Artist genres: ${artist.genres?.join(", ") || "Independent"}
Venue genres: ${venue.genres?.join(", ")}
Venue capacity: ${venue.capacity}
Venue notes: ${venue.notes}
Pay range: ${venue.pay}

Write 3-4 short paragraphs: (1) introduce the artist and their sound, (2) explain why they want to play this specific venue and how it fits their tour/strategy, (3) mention key streaming milestones or social stats (use plausible numbers like "We've accumulated 50,000+ Spotify streams..."), (4) clear ask with flexibility on dates. Professional, confident, not desperate. First person from the artist/manager.`,
    }).then((res) => {
      setBody(typeof res === "string" ? res : res?.text || res?.content || "");
      setGenerating(false);
    });
  }, []);

  const copy = () => { navigator.clipboard.writeText(body); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 z-10 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Booking Inquiry</p>
          <p className="font-heading font-bold text-lg">{venue.name}</p>
          <p className="text-xs text-muted-foreground">{venue.city} · {venue.capacity} cap · {venue.pay}</p>
        </div>
        {generating ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Writing your booking email...
          </div>
        ) : (
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10}
            className="w-full rounded-xl border border-input bg-secondary/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
        )}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <a href={`mailto:${venue.booking_email}?subject=Booking Inquiry — ${artist.name}`}
            className="text-xs text-primary underline">{venue.booking_email}</a>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <><Check className="h-3.5 w-3.5 mr-1" />Copied</> : <><Copy className="h-3.5 w-3.5 mr-1" />Copy</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Copy({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/></svg>; }

export default function GigFinder() {
  const [genre, setGenre] = useState("All");
  const [city, setCity] = useState("");
  const [venueType, setVenueType] = useState("All");
  const [artistName, setArtistName] = useState("");
  const [artistGenres, setArtistGenres] = useState([]);
  const [bookingModal, setBookingModal] = useState(null);

  const GENRES = ["All", "Hip Hop", "Pop", "R&B", "Indie", "EDM", "Country", "Rock", "Latin"];
  const TYPES = ["All", "Club", "Bar/Venue", "Concert Hall", "Arts Venue", "Amphitheater"];

  const filtered = VENUE_DB.filter((v) => {
    const genreMatch = genre === "All" || v.genres.includes(genre) || v.genres.includes("All");
    const cityMatch = !city.trim() || v.city.toLowerCase().includes(city.toLowerCase());
    const typeMatch = venueType === "All" || v.type === venueType;
    return genreMatch && cityMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      {bookingModal && <EPKModal venue={bookingModal} artist={{ name: artistName || "Your Artist", genres: genre !== "All" ? [genre] : [] }} onClose={() => setBookingModal(null)} />}

      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring & Bookings</p>
          <h1 className="font-heading text-4xl font-bold">Gig Finder</h1>
          <p className="text-muted-foreground">Browse independent venues, filter by genre and city, and get an AI-written booking inquiry in seconds.</p>
        </motion.div>

        {/* Artist name + filters */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <Input placeholder="Your artist/band name (for booking emails)" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <select value={genre} onChange={(e) => setGenre(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
            <Input placeholder="Filter by city..." value={city} onChange={(e) => setCity(e.target.value)} className="h-9 text-sm" />
            <select value={venueType} onChange={(e) => setVenueType(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} venues found</p>
        </div>

        {/* Venue grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((venue) => (
            <motion.div key={venue.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card border border-border p-5 space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading font-bold text-sm">{venue.name}</p>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground shrink-0">{venue.type}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{venue.city}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Music className="h-3 w-3" />{venue.capacity} cap</span>
                  <span className="flex items-center gap-1 text-xs text-primary font-medium"><DollarSign className="h-3 w-3" />{venue.pay}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {venue.genres.slice(0, 4).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground">{g}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">{venue.notes}</p>
              <div className="flex items-center gap-2">
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><ExternalLink className="h-3 w-3" />Website</Button>
                  </a>
                )}
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setBookingModal(venue)}>
                  <Send className="h-3 w-3" /> Write Booking Email
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* External resources */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <p className="font-heading font-bold text-xl">External Booking Resources</p>
            <p className="text-muted-foreground text-sm">The best platforms for finding gigs beyond this tool.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOOKING_RESOURCES.map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                className="rounded-2xl bg-card border border-border p-4 space-y-2 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{r.icon}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}