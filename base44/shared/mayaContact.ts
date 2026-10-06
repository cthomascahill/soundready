// Shared Sam helper. The whole point of Sam is that they figure out who
// to contact — drafts land on the artist's desk with a real recipient.

const BAD_EMAIL_WORDS = ["null", "none", "n/a", "unknown", "undefined", "not found", "no email"];

// LLMs sometimes answer "null"/"none" in plain text — only real addresses pass.
export function sanitizeEmail(raw) {
  const email = String(raw || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return undefined;
  if (BAD_EMAIL_WORDS.includes(email.toLowerCase())) return undefined;
  return email;
}

/**
 * Hunts down the publicly listed contact email for an opportunity when the
 * first search pass didn't surface one. Returns { email, source } — email
 * is undefined if nothing published could be found.
 */
export async function findContactEmail(base44, { org, opportunity, link, context }) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      model: "gemini_3_1_pro",
      add_context_from_internet: true,
      prompt: `Find the official contact email address that ${org || "the organizers"} of "${opportunity}" publicly list${context || ""}. Check their official website (contact/about/submissions pages), the submission page itself${link ? ` (${link})` : ""}, and their social media bios and posts. Addresses like submissions@, booking@, beats@, demos@, info@ or contact@ on their real domain are exactly what you want, as long as the address is actually published somewhere. Return the email ONLY if you genuinely found it published, together with where you found it. Never invent, complete, or guess an email address.`,
      response_json_schema: {
        type: "object",
        properties: {
          email: { type: "string" },
          source: { type: "string" },
        },
      },
    });
    const email = sanitizeEmail(result?.email);
    if (!email) return { email: undefined, source: undefined };
    return { email, source: String(result?.source || "found by Sam").trim() };
  } catch (err) {
    console.log(`mayaContact: email hunt failed for "${opportunity}": ${err.message}`);
    return { email: undefined, source: undefined };
  }
}