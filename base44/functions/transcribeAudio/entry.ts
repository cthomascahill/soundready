import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASSEMBLYAI_KEY = Deno.env.get("ASSEMBLYAI_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { audio_url } = await req.json();
    if (!audio_url) return Response.json({ error: "audio_url required" }, { status: 400 });

    if (!ASSEMBLYAI_KEY) {
      return Response.json({ transcript: null, error: "No AssemblyAI key configured" });
    }

    // Start transcription job
    const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "authorization": ASSEMBLYAI_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url,
        speech_model: "universal-2",
      }),
    });

    if (!transcriptRes.ok) {
      const err = await transcriptRes.text();
      return Response.json({ transcript: null, error: `AssemblyAI error: ${err}` });
    }

    const job = await transcriptRes.json();
    const jobId = job.id;

    // Poll until complete (max 120s)
    const startTime = Date.now();
    while (Date.now() - startTime < 120000) {
      await new Promise(r => setTimeout(r, 3000));

      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${jobId}`, {
        headers: { "authorization": ASSEMBLYAI_KEY },
      });
      const pollData = await pollRes.json();

      if (pollData.status === "completed") {
        return Response.json({ transcript: pollData.text || null });
      }
      if (pollData.status === "error") {
        return Response.json({ transcript: null, error: pollData.error });
      }
    }

    return Response.json({ transcript: null, error: "Transcription timed out" });
  } catch (error) {
    return Response.json({ transcript: null, error: error.message });
  }
});