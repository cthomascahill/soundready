import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Navigation, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = [0, 6, 9, 12, 15, 18, 21];
const HOUR_LABELS = ["12am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];

function GeographicHotspots({ cities, onAdd, onRemove }) {
  const [city, setCity] = useState("");
  const [count, setCount] = useState("");

  const handleAdd = () => {
    if (!city.trim() || !count) return;
    onAdd({ city: city.trim(), listeners: parseInt(count) });
    setCity(""); setCount("");
  };

  const sorted = [...cities].sort((a, b) => b.listeners - a.listeners);
  const max = sorted[0]?.listeners || 1;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-bold text-lg">Geographic Hotspots</h2>
      </div>
      <p className="text-xs text-muted-foreground">Enter your top cities from Spotify for Artists. <span className="text-primary">Connect Spotify for Artists for automatic updates — coming soon.</span></p>

      <div className="flex gap-2">
        <Input placeholder="City (e.g. Atlanta, GA)" value={city} onChange={e => setCity(e.target.value)} className="flex-1" />
        <Input placeholder="Listeners" type="number" value={count} onChange={e => setCount(e.target.value)} className="w-28" />
        <Button size="sm" onClick={handleAdd} disabled={!city.trim() || !count} className="shrink-0 gap-1">
          <Plus className="h-3.5 w-3.5" />Add
        </Button>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.city}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{c.listeners.toLocaleString()} listeners</span>
                    <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(c.listeners / max) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">Add your top cities to visualize your listener base.</p>
      )}
    </div>
  );
}

function ListeningPatterns({ patterns, onUpdate }) {
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [intensity, setIntensity] = useState("high");
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    if (!day || !hour) return;
    onUpdate([...patterns, { day, hour: parseInt(hour), intensity }]);
    setDay(""); setHour("");
  };

  const getRecommendation = async () => {
    if (!patterns.length) return;
    setLoading(true);
    const summary = patterns.map(p => `${p.day} at ${p.hour}:00 (${p.intensity} activity)`).join(", ");
    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `An independent artist's fans are most active at these times: ${summary}. Give a specific, direct 2-sentence recommendation on the best days and times to release music and post on social media. Reference the actual days and times. Be concrete.`,
    });
    setRecommendation(res);
    setLoading(false);
  };

  const intensityColor = { high: "bg-primary", medium: "bg-primary/50", low: "bg-primary/20" };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-bold text-lg">Listening Patterns</h2>
      </div>
      <p className="text-xs text-muted-foreground">Enter your peak listening times from Spotify for Artists.</p>

      <div className="flex flex-wrap gap-2">
        <select value={day} onChange={e => setDay(e.target.value)} className="h-9 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">Select day</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={hour} onChange={e => setHour(e.target.value)} className="h-9 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">Select time</option>
          {HOUR_LABELS.map((h, i) => <option key={i} value={HOURS[i]}>{h}</option>)}
        </select>
        <select value={intensity} onChange={e => setIntensity(e.target.value)} className="h-9 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button size="sm" onClick={handleAdd} disabled={!day || !hour} className="gap-1">
          <Plus className="h-3.5 w-3.5" />Add
        </Button>
      </div>

      {patterns.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <td className="w-12" />
                  {DAYS.map(d => <th key={d} className="text-center p-1 font-medium text-muted-foreground">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {HOUR_LABELS.map((label, hi) => (
                  <tr key={hi}>
                    <td className="text-right pr-2 text-muted-foreground py-0.5">{label}</td>
                    {DAYS.map(d => {
                      const match = patterns.find(p => p.day === d && p.hour === HOURS[hi]);
                      return (
                        <td key={d} className="p-0.5">
                          <div className={`h-5 w-full rounded ${match ? intensityColor[match.intensity] : "bg-secondary"}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button size="sm" variant="outline" onClick={getRecommendation} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Get Release Timing Recommendation
          </Button>
          {recommendation && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm leading-relaxed">{recommendation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AudienceInsights({ songs, cities }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))].join(", ");
    const artists = [...new Set(songs.flatMap(s => s.similar_artists || []))].slice(0, 5).join(", ");
    const topCities = cities.slice(0, 5).map(c => c.city).join(", ");

    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are a music marketing strategist. Build a detailed audience profile for an independent artist based on these data points:

Genres: ${genres || "not specified"}
Comparable artists: ${artists || "not specified"}
Top listener cities: ${topCities || "not specified"}

Write a specific audience demographic brief — who their fans likely are, what else they listen to, what their lifestyle looks like, what content resonates with them, and what kind of brand partnerships would make sense. Be specific and useful. Write it like a real marketing brief, not generic AI output.`,
      response_json_schema: {
        type: "object",
        properties: {
          demographics: { type: "string" },
          listeningHabits: { type: "string" },
          lifestyle: { type: "string" },
          contentResonance: { type: "string" },
          brandOpportunities: { type: "string" }
        }
      }
    });
    setProfile(res);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">Audience Insights</h2>
        </div>
        <Button size="sm" variant="outline" onClick={generate} disabled={loading || !songs.length} className="gap-2 shrink-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {profile ? "Refresh" : "Generate Profile"}
        </Button>
      </div>
      {!songs.length ? (
        <p className="text-sm text-muted-foreground">Analyze some songs first to generate an audience profile.</p>
      ) : loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-secondary animate-pulse" />)}</div>
      ) : profile ? (
        <div className="space-y-3">
          {[
            { label: "Demographics", value: profile.demographics },
            { label: "Listening Habits", value: profile.listeningHabits },
            { label: "Lifestyle", value: profile.lifestyle },
            { label: "What Content Resonates", value: profile.contentResonance },
            { label: "Brand Opportunities", value: profile.brandOpportunities },
          ].filter(s => s.value).map((section, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/40 border border-border space-y-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{section.label}</p>
              <p className="text-sm leading-relaxed">{section.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Click Generate Profile to build an audience brief from your song data and city data.</p>
      )}
    </div>
  );
}

function TourRouting({ cities }) {
  const [routing, setRouting] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!cities.length) return;
    setLoading(true);
    const cityList = cities.map(c => `${c.city}: ${c.listeners.toLocaleString()} listeners`).join(", ");
    const res = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `An independent artist has listeners in these cities: ${cityList}. Suggest the most logical tour routing, hitting their strongest markets first. Consider geographic proximity for routing efficiency. Return an ordered list of 5-8 cities with a brief note (1 sentence) on why each city is recommended. Be specific.`,
      response_json_schema: {
        type: "object",
        properties: {
          routing: {
            type: "array",
            items: {
              type: "object",
              properties: {
                city: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });
    setRouting(res);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">Tour Routing Intelligence</h2>
        </div>
        <Button size="sm" variant="outline" onClick={generate} disabled={loading || !cities.length} className="gap-2 shrink-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {routing ? "Refresh" : "Generate Route"}
        </Button>
      </div>
      {!cities.length ? (
        <p className="text-sm text-muted-foreground">Add your top listener cities above to get tour routing recommendations.</p>
      ) : routing ? (
        <div className="space-y-2">
          {routing.routing?.map((stop, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/30">
              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div>
                <p className="font-semibold text-sm">{stop.city}</p>
                <p className="text-xs text-muted-foreground">{stop.reason}</p>
              </div>
            </div>
          ))}
          <Link to="/tour-planner">
            <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
              <Navigation className="h-3.5 w-3.5" />Open Tour Planner
            </Button>
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Click Generate Route to get a smart tour routing based on your listener data.</p>
      )}
    </div>
  );
}

export default function FanIntelligence() {
  const [songs, setSongs] = useState([]);
  const [cities, setCities] = useState(() => {
    const saved = localStorage.getItem("fan_intel_cities");
    return saved ? JSON.parse(saved) : [];
  });
  const [patterns, setPatterns] = useState(() => {
    const saved = localStorage.getItem("fan_intel_patterns");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 10)
      .then(setSongs).catch(() => setSongs([]));
  }, []);

  const saveCities = (updated) => {
    setCities(updated);
    localStorage.setItem("fan_intel_cities", JSON.stringify(updated));
  };

  const savePatterns = (updated) => {
    setPatterns(updated);
    localStorage.setItem("fan_intel_patterns", JSON.stringify(updated));
  };

  const removeCity = (index) => saveCities(cities.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Analytics</p>
          <h1 className="font-heading text-4xl font-bold">Fan Intelligence</h1>
          <p className="text-muted-foreground">Understand where your fans are, when they listen, and who they are.</p>
        </motion.div>

        <GeographicHotspots cities={cities} onAdd={c => saveCities([...cities, c])} onRemove={removeCity} />
        <ListeningPatterns patterns={patterns} onUpdate={savePatterns} />
        <AudienceInsights songs={songs} cities={cities} />
        <TourRouting cities={cities} />
      </div>
    </div>
  );
}