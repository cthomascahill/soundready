import { base44 } from "@/api/base44Client";
import { ASK_SAM_TOOLS } from "@/lib/askSamTools";

const toolList = ASK_SAM_TOOLS.map((t) => `${t.path}, ${t.name} (${t.tier}): ${t.desc}`).join("\n");

// Tie-breakers for the pairs the model kept confusing. These are the tools'
// real jobs in Sam's own words, so a vague ask lands on the right screen.
const ROUTING_RULES = `Routing rules, follow these exactly when two tools seem close:
- Playlist pitching, playlist curators, "help me pitch my song to playlists", "get me on playlists" → /sam-desk. Sam matches the song to curators there and drafts the pitch for approval. Never route this anywhere else.
- Royalties, "what did my releases actually earn", streaming income → /royalties. /royalty-calculator is ONLY for hypothetical "what would X streams pay" estimates.
- Stored songs, catalog, projects, artwork, demo/share links → /history (Vault). A song's progress through stages, "where is this song at", release pipeline → /song-tracker.
- Venues, "where should I play", booking a show → /gig-finder. A full tour with routes and dates → /tour-planner. Tour budgets, payouts, taxes on the road → /tour-finance.
- Giving Sam a research or outreach task to run ("find me venues in Denver", "research labels") → /tell-sam. Approving drafts Sam already made → /sam-desk.
- "What should I focus on / do this week", strategy, career advice, opinions → answer in chat from the artist's data. Open nothing unless they ask to see a specific screen.`;

/**
 * One turn of the Ask Sam chat: answers like Sam, and can pick a tool from
 * the platform to open right inside the chat view.
 */
export async function askSamCall(messages, systemPrompt) {
  const history = messages
    .map((m) => `${m.role === "user" ? "Artist" : "Sam"}: ${m.content}`)
    .join("\n\n");

  const prompt = `${systemPrompt}

---SOUNDREADY PLATFORM, tools you can open for the artist---
${toolList}
---END TOOLS---

---CONVERSATION HISTORY---
${history}
---END HISTORY---

Now respond as Sam to the artist's latest message.

NAVIGATION, whether to open a tool:
- Set navigate_path ONLY when the artist's latest message clearly asks to see, open, or work inside one specific tool ("show me my tracker", "open my vault", "help me pitch this song to playlists").
- navigate_path must be copied exactly from the tool list above. Never invent, shorten, or guess a path. If the path you want is not in the list, leave navigate_path empty.
- For questions, advice, strategy, numbers you already have in context, or anything you can answer in chat: leave navigate_path empty ("") and just answer. When unsure, open nothing.
${ROUTING_RULES}
- When you do open a tool: reply with one short line saying what the screen shows plus one thing they can do there. Nothing else.

RESPONSE STYLE: lead with the direct answer in 1-2 sentences. Add at most 3-4 tight bullets only when they genuinely help. No preamble, no restating the question, no sign-offs. Use markdown bold and bullets to stay scannable.

chips: at most 3 short follow-up actions (max 5 words each, phrased as commands). Never restate the question.

Return your response as JSON:
{
  "response": "your full markdown response here",
  "navigate_path": "exact tool path from the list, or empty string",
  "chips": ["follow-up 1", "follow-up 2"]
}`;

  return await base44.integrations.Core.InvokeLLM({
    prompt,
    model: "claude_sonnet_4_6",
    response_json_schema: {
      type: "object",
      properties: {
        response: { type: "string" },
        navigate_path: { type: "string" },
        chips: { type: "array", items: { type: "string" } },
      },
      required: ["response", "navigate_path", "chips"],
    },
  });
}