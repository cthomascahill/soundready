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

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to SoundReady</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=Inter:wght@400;500&display=swap');
    body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', sans-serif; color: #f2f2f2; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 900; color: #f2f2f2; margin-bottom: 40px; }
    .logo span { color: #3dba6f; }
    .badge { display: inline-block; background-color: rgba(220,38,38,0.12); border: 1px solid rgba(220,38,38,0.3); color: #ef4444; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 28px; }
    h1 { font-family: 'Space Grotesk', sans-serif; font-size: 38px; font-weight: 900; line-height: 1.1; margin: 0 0 16px; color: #f2f2f2; }
    h1 span { color: #3dba6f; }
    p { font-size: 15px; color: #808080; line-height: 1.7; margin: 0 0 24px; }
    .tools { background-color: #141414; border: 1px solid #282828; border-radius: 12px; padding: 24px; margin: 28px 0; }
    .tools-title { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; color: #3dba6f; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px; }
    .tool-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
    .tool-dot { width: 6px; height: 6px; background: #3dba6f; border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
    .tool-text { font-size: 14px; color: #d4d4d4; line-height: 1.5; }
    .cta-btn { display: inline-block; background-color: #3dba6f; color: #ffffff; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin: 8px 0 32px; }
    .divider { border: none; border-top: 1px solid #282828; margin: 32px 0; }
    .footer { font-size: 12px; color: #404040; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo"><span>Sound</span>Ready</div>

    <div class="badge">🔥 The Artist Management Revolution</div>

    <h1>Fire your manager.<br/><span>You're in.</span></h1>

    <p>Hey ${userName}, welcome to SoundReady — the AI-powered platform that does everything your manager does, without taking 15–20% of your income. Your toolkit is ready.</p>

    <div class="tools">
      <div class="tools-title">What's waiting for you</div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">AI release plan — full strategy in 60 seconds</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Playlist Pitcher + Curator CRM</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Press Kit & Pitch Deck generator</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Finance tracker + Royalty dashboard</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Booking tools + Gig Finder</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">25+ more tools — all in one platform</div></div>
    </div>

    <p>Analyze your first track and get a complete release strategy now:</p>

    <a href="https://soundready.app/release-plan" class="cta-btn">Analyze My First Track →</a>

    <hr class="divider"/>

    <div class="footer">
      You're receiving this because you created a SoundReady account.<br/>
      Questions? Just reply to this email — we're here.<br/><br/>
      — The SoundReady Team
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: "Welcome to SoundReady — Fire your manager. 🔥",
      body: htmlBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});