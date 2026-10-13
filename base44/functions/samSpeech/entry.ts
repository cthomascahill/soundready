import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import OpenAI from 'npm:openai';

// Curated premium voices (gpt_4o_mini_tts) Sam can speak with
const ALLOWED_VOICES = ['nova', 'coral', 'sage', 'shimmer', 'alloy'];
const DEFAULT_VOICE = 'nova';
const MAX_CHARS = 4000;
const SAM_INSTRUCTIONS =
  "You are Sam, the artist's supportive music manager. Speak like a warm, confident, encouraging human: friendly and conversational, natural pacing, never robotic.";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice } = await req.json();
    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }
    const clean = text.slice(0, MAX_CHARS);
    const voiceName = ALLOWED_VOICES.includes(voice) ? voice : DEFAULT_VOICE;

    const { baseURL, token, headers } = base44.asServiceRole.aiGateway.connection();
    const client = new OpenAI({ baseURL, apiKey: token, defaultHeaders: headers, maxRetries: 0 });
    const audio = await client.audio.speech.create({
      model: 'gpt_4o_mini_tts',
      input: clean,
      voice: voiceName,
      instructions: SAM_INSTRUCTIONS,
    });

    const file = new File([await audio.arrayBuffer()], 'sam.mp3', { type: 'audio/mpeg' });
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    return Response.json({ file_uri, voice: voiceName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}