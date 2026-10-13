import { base44 } from "@/api/base44Client";
import { ASK_SAM_TOOLS } from "@/lib/askSamTools";

const toolList = ASK_SAM_TOOLS.map((t) => `${t.path} — ${t.name} (${t.tier}): ${t.desc}`).join("\n");

/**
 * One turn of the Ask Sam chat: answers like Sam, and can pick a tool from
 * the platform to open right inside the chat view.
 */
export async function askSamCall(messages, systemPrompt) {
  const history = messages
    .map((m) => `${m.role === "user" ? "Artist" : "Sam"}: ${m.content}`)
    .join("\n\n");

  const prompt = `${systemPrompt}

---SOUNDREADY PLATFORM — tools you can open for the artist---
${toolList}
---END TOOLS---

---CONVERSATION HISTORY---
${history}
---END HISTORY---

Now respond as Sam to the artist's latest message.

NAVIGATION: If the artist wants to see, open, or work on something the platform has ("show me my tracker", "where are my royalties", "I want to plan a tour", "open my vault"), set navigate_path to that tool's exact path from the list above, and keep your reply to a short line about what it is plus one thing they can do there. Otherwise leave navigate_path empty and just answer.

RESPONSE STYLE: keep it SHORT. Lead with the direct answer in 1-2 sentences, then at most 3-4 tight bullets only when they genuinely help. No preamble, no restating the question. Use markdown bold and bullets to stay scannable.

Return your response as JSON:
{
  "response": "your full markdown response here",
  "navigate_path": "exact tool path, or empty string",
  "chips": ["follow-up suggestion 1", "suggestion 2", "suggestion 3"]
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