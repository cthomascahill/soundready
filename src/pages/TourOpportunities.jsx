import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Music2, ExternalLink, Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OpeningSlotPitchModal from "@/components/tourop/OpeningSlotPitchModal";

export default function TourOpportunities() {
  const [tours, setTours] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "", location: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [artistData, setArtistData] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.OpeningSlotPitch.list("-created_date", 100),
      base44.auth.me(),
    ]).then(([p, user]) => {
      setPitches(p);
      setArtistData(user);
    });
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    const response = await base44.functions.invoke("fetchTourOpportunities", {
      query: searchQuery,
      genre: filters.genre || undefined,
      location: filters.location || undefined,
    });

    setTours(response.data?.tours || []);
    setLoading(false);
  };

  const filteredTours = tours.filter((tour) => {
    const matchesGenre = !filters.genre || (tour.genres && tour.genres.includes(filters.genre));
    const matchesLocation = !filters.location || tour.location?.includes(filters.location);
    return matchesGenre && matchesLocation;
  });

  const handlePitchCreated = async (pitchData) => {
    const created = await base44.entities.OpeningSlotPitch.create(pitchData);
    setPitches((prev) => [created, ...prev]);
    setModalOpen(false);
    setSelectedTour(null);
  };

  const hasPitched = (tour) => {
    return pitches.some((p) => p.tour_artist === tour.artist_name || p.tour_artist === tour.name);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <AnimatePresence>
        {modalOpen && selectedTour && (
          <OpeningSlotPitchModal
            tour={selectedTour}
            artistData={artistData}
            onClose={() => setModalOpen(false)}
            onPitchCreated={handlePitchCreated}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring</p>
          <h1 className="font-heading text-4xl font-bold">Tour Opportunities</h1>
          <p className="text-muted-foreground text-sm mt-2">Find announced tours and request opening slots.</p>
        </motion.div>

        {/* Pitches summary */}
        {pitches.length > 0 && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Pitch Tracking</p>
            <div className="flex flex-wrap gap-2">
              {pitches.slice(0, 5).map((pitch) => (
                <div
                  key={pitch.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span className="text-primary font-medium">{pitch.tour_artist}</span>
                  <span className="text-primary/60">({pitch.status})</span>
                </div>
              ))}
              {pitches.length > 5 && (
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                  +{pitches.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search section */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search artist, tour name, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 h-11"
            />
            <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()} className="gap-2 h-11">
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Genre:</label>
              <select
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Pop">Pop</option>
                <option value="R&B">R&B</option>
                <option value="Rock">Rock</option>
                <option value="EDM">EDM</option>
                <option value="Indie">Indie</option>
                <option value="Country">Country</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Location:</label>
              <Input
                placeholder="City or state"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="h-8 text-xs w-40"
              />
            </div>
          </div>
        </div>

        {/* Tours listing */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">Searching for tour opportunities...</p>
              </div>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Music2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {tours.length === 0 ? "Search for tours to get started" : "No tours match your filters"}
              </p>
            </div>
          ) : (
            filteredTours.map((tour, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl bg-card border border-border p-5 space-y-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-lg">{tour.artist_name || tour.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{tour.tour_name}</p>
                  </div>
                  {tour.url && (
                    <a href={tour.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {tour.dates && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{tour.dates}</span>
                    </div>
                  )}
                  {tour.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{tour.location}</span>
                    </div>
                  )}
                </div>

                {tour.description && <p className="text-sm text-muted-foreground leading-relaxed">{tour.description}</p>}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant={hasPitched(tour) ? "outline" : "default"}
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setSelectedTour(tour);
                      setModalOpen(true);
                    }}
                    disabled={hasPitched(tour)}
                  >
                    {hasPitched(tour) ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Already Pitched
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Generate Pitch
                      </>
                    )}
                  </Button>
                  {tour.url && (
                    <a href={tour.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        View Full Tour
                      </Button>
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}