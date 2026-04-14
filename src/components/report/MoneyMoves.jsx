import { DollarSign } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

const OPPORTUNITY_POOLS = {
  sync: {
    title: "Sync Licensing — Film & TV",
    icon: "🎬",
    getBody: (song) => `"${song.title || "Your track"}" has strong sync potential given its ${song.mood?.toLowerCase() || "emotional"} mood and ${song.energy?.toLowerCase() || "dynamic"} energy. ${song.genre} tracks with this kind of emotional texture are consistently placed in drama series, indie films, and branded content. Sync deals typically pay $500–$5,000 for indie placements and $10,000–$100,000+ for major TV/film.`,
    action: "Register your track with a sync licensing platform like Musicbed, Artlist, or Pond5. Submit directly to music supervisors on LinkedIn using your release's press kit.",
  },
  brand: {
    title: "Brand Partnership Opportunity",
    icon: "🤝",
    getBody: (song) => `The ${song.mood?.toLowerCase() || "emotional"} atmosphere of "${song.title || "your track"}" aligns well with lifestyle, wellness, and fashion brands targeting ${song.audience || "young"} consumers. Brands actively seek independent artists with engaged audiences — your sound creates an authentic backdrop for product campaigns without feeling forced.`,
    action: "Build a one-page media kit with your streaming stats, social following, and song profile. Pitch directly to brand partnership managers on LinkedIn or through platforms like AspireIQ or Creator.co.",
  },
  youtube: {
    title: "YouTube Content Monetization",
    icon: "▶️",
    getBody: (song) => `A ${song.genre} song with ${song.mood?.toLowerCase() || "strong"} emotional resonance can anchor a YouTube content strategy beyond just a music video. React content, lyric breakdowns, acoustic versions, and 'making of' vlogs around "${song.title || "your track"}" build long-term catalog value. YouTube's ad revenue from 1M views can range from $1,500–$4,000 depending on audience geography.`,
    action: "Upload the official audio, lyric video, and a vertical cut as three separate videos on the same release day. Enable Content ID through your distributor immediately to capture sync revenue from fan covers.",
  },
  live: {
    title: "Live Performance Market Expansion",
    icon: "🎤",
    getBody: (song) => `${song.genre} is experiencing strong live market growth in mid-size venues (300–1,500 capacity) across major college towns and coastal cities. A track with this level of energy and audience match creates strong booking leverage — promoters use streaming data to assess draw potential. Your AI score directly translates to pitch credibility.`,
    action: "Use your SoundReady streaming data export as leverage when booking. Target college venues, local festivals, and genre-specific showcase events. Apply to SXSW, CMJ, or regional genre showcases with your release as the centerpiece.",
  },
  merch: {
    title: "Merchandise Concept",
    icon: "👕",
    getBody: (song) => `The Visual Identity from your SoundReady report gives you a complete merchandise brief without hiring a designer. The ${MOOD_COLOR[song.mood] || "aesthetic"} palette and "${song.title || "track"}" artwork can anchor a limited merch drop timed to release — hoodies, tote bags, and printed lyric art are the highest-converting items for independent artists at this stage.`,
    action: "Use Printful or Printify connected to a Shopify store. Drop merch the same day as the release — the announcement post performs better with a visual product attached. Limit to 50 units to create scarcity.",
  },
  tiktok_fund: {
    title: "TikTok Creator Fund & Sound Revenue",
    icon: "🎵",
    getBody: (song) => `Every time a TikTok creator uses "${song.title || "your track"}" in their video, you earn a licensing royalty through your distributor's TikTok deal. For a ${song.genre} song with ${song.mood?.toLowerCase() || "strong"} viral potential, the multiplier effect of even 500 creators using your sound can generate meaningful passive income and exponential organic reach simultaneously.`,
    action: "Register your track with a distributor that has an active TikTok licensing deal (DistroKid, TuneCore, CD Baby all qualify). Create a dedicated sound page and actively encourage fan use with a pinned comment campaign.",
  },
};

const MOOD_COLOR = {
  Happy: "warm golden", Melancholic: "cool blue-grey", Hype: "electric red-orange",
  Romantic: "soft pastel", Dark: "deep black", Inspirational: "teal-and-white", Chill: "muted ocean",
};

function getOpportunities(song) {
  const genre = song.genre || "";
  const mood = song.mood || "";
  const energy = song.energy || "";

  const keys = ["sync", "brand", "youtube"];
  if (["Hip Hop", "Pop", "R&B", "Latin"].includes(genre)) keys.push("tiktok_fund");
  else if (energy === "High") keys.push("live");
  else keys.push("merch");

  return keys.slice(0, 3).map((k) => ({ ...OPPORTUNITY_POOLS[k], body: OPPORTUNITY_POOLS[k].getBody(song) }));
}

export default function MoneyMoves({ song = {} }) {
  const opportunities = getOpportunities(song);
  return (
    <ReportCard borderColor="border-l-yellow-500">
      <CardHeader icon={DollarSign} title="Money Moves" iconColor="text-yellow-400" badge="Section 11" />
      <p className="text-sm text-muted-foreground -mt-2">Three revenue pathways identified for this release based on genre, mood, and audience profile.</p>
      <div className="space-y-4">
        {opportunities.map((opp, i) => (
          <div key={i} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{opp.icon}</span>
              <p className="font-heading font-bold text-base">{opp.title}</p>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{opp.body}</p>
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
              <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold mb-1">Action Step</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{opp.action}</p>
            </div>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}