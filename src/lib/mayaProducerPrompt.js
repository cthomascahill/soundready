/**
 * Maya's producer-mode system prompt — built from the producer's real
 * catalog, placements, client pipeline, and beat store sales.
 */
export function buildProducerSystemPrompt(user, profile, beats, placements, clients, sales) {
  const name = profile?.stage_name || user?.full_name || "this producer";

  const genres = [...new Set((beats || []).map(b => b.genre).filter(Boolean))];
  const stageCounts = (beats || []).reduce((acc, b) => {
    const stage = b.stage || "Idea";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});
  const stageStr = Object.entries(stageCounts).map(([s, n]) => `${n} ${s}`).join(", ") || "none yet";
  const forSale = (beats || []).filter(b => b.for_sale).length;
  const recentBeats = (beats || []).slice(0, 5).map(b =>
    `"${b.title}" (${b.genre || "?"}, ${b.bpm || "?"} BPM, key ${b.key || "?"}, stage: ${b.stage || "Idea"})`
  ).join("; ") || "No beats in the vault yet";

  const placementStr = (placements || []).length > 0
    ? `${placements.length} placement(s), total fees $${(placements.reduce((s, p) => s + (p.fee || 0), 0)).toLocaleString()} — most recent: ${(placements.slice(0, 3).map(p => `${p.artist_name} (${p.deal_type}${p.fee ? `, $${p.fee.toLocaleString()}` : ""})`).join(", "))}`
    : "No placements recorded yet";

  const clientStr = (clients || []).length > 0
    ? (() => {
      const byStage = (clients || []).reduce((acc, c) => {
        const st = c.stage || "Prospect";
        acc[st] = (acc[st] || 0) + 1;
        return acc;
      }, {});
      const stagePart = Object.entries(byStage).map(([s, n]) => `${n} ${s}`).join(", ");
      const notable = (clients || []).slice(0, 3).map(c => c.name).join(", ");
      return `${clients.length} client(s): ${stagePart}. Key relationships: ${notable}`;
    })()
    : "No clients in the CRM yet";

  const salesStr = (sales || []).length > 0
    ? `${sales.length} beat store sale(s), total revenue $${(sales.reduce((s, x) => s + (x.amount || 0), 0)).toLocaleString()}`
    : "No beat store sales yet";

  return `You are Maya, an AI music industry manager built into SoundReady. You are speaking with ${name}, a music producer.

PRODUCER CATALOG (Productions):
- Total beats: ${(beats || []).length}; by stage: ${stageStr}
- Genres: ${genres.join(", ") || "unspecified"}
- Listed for sale in their Beat Store: ${forSale}
- Recent beats: ${recentBeats}

PLACEMENTS:
- ${placementStr}

CLIENT PIPELINE (CRM):
- ${clientStr}

BEAT STORE SALES:
- ${salesStr}

INSTRUCTIONS:
You have deep knowledge of the music industry from the producer side: beat placements, lease vs. exclusive pricing, pitching beats to artists and A&Rs, sync licensing for instrumentals, building a producer brand (producer tags, type beats, YouTube/Spotify presence), and turning a beat catalog into recurring income.

You speak directly, honestly, and like a real manager who is invested in their success. You do NOT give generic advice. Every response is specific to this producer's actual situation based on their catalog, placements, pipeline, and connected platform data below.

If their catalog is thin or their placements are low, address it directly without sugarcoating. Reference their real beats by name when relevant. Focus your advice on placements, artist pitching, pricing, catalog growth, and producer brand — only discuss touring/booking if they ask. You remember the full conversation history within this session.

Keep responses focused and actionable. Use markdown formatting (bold, bullet points) to make responses scannable. End with a concrete next step when relevant.`;
}

export const PRODUCER_QUICK_STARTS = [
  "How do I get my beats placed this quarter?",
  "Which artists should I pitch my catalog to?",
  "Am I pricing my leases right?",
  "What's my biggest opportunity right now?",
];