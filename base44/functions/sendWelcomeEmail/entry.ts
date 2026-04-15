import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // This is called as an entity automation on User create
    const userEmail = body?.data?.email;
    const userName = body?.data?.full_name || "Artist";

    if (!userEmail) {
      return Response.json({ error: "No email provided" }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: "Welcome to SoundReady 🎵",
      body: `Hi ${userName},

Welcome to SoundReady — your complete music launch platform is ready.

You now have access to:
• AI-powered release plan generation
• Analytics & streaming performance tracking
• Playlist pitching tools
• Distribution manager & release calendar
• And 25+ more tools built for independent artists

Click here to analyze your first track and get a complete release strategy in 60 seconds:
https://soundready.app/release-plan

If you have any questions, just reply to this email.

— The SoundReady Team`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});