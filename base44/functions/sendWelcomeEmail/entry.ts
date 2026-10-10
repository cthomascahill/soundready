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
  <title>Your career, in motion.</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: Arial, Helvetica, sans-serif; color: #fafafa; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 0 20px 40px; }
    .header { background-color: #21c45d; padding: 20px 24px; }
    .header img { height: 36px; display: block; }
    h1 { font-family: "Space Grotesk", Arial, sans-serif; font-size: 34px; font-weight: 900; line-height: 1.1; margin: 36px 0 16px; color: #fafafa; }
    h1 span { color: #21c45d; }
    p { font-size: 15px; color: #8c8c8c; line-height: 1.7; margin: 0 0 24px; }
    .tools { background-color: #141414; border: 1px solid #282828; border-radius: 10px; padding: 24px; margin: 28px 0; }
    .tools-title { font-family: "Space Grotesk", Arial, sans-serif; font-size: 13px; font-weight: 700; color: #21c45d; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px; }
    .tool-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
    .tool-dot { width: 6px; height: 6px; background: #21c45d; border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
    .tool-text { font-size: 14px; color: #d4d4d4; line-height: 1.5; }
    .cta-btn { display: inline-block; background-color: #21c45d; color: #000000; font-family: "Space Grotesk", Arial, sans-serif; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin: 8px 0 32px; }
    .divider { border: none; border-top: 1px solid #282828; margin: 32px 0; }
    .footer { font-size: 12px; color: #8c8c8c; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="header"><img src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/010253974_ChatGPTImageJun11202609_02_49AM.png" alt="SoundReady" /></div>
  <div class="wrapper">
    <h1>Your career,<br/><span>in motion.</span></h1>

    <p>Hey ${userName}, welcome to SoundReady. Every song, show, deal and dollar in one place, built for independent artists. Start free, no card required.</p>

    <div class="tools">
      <div class="tools-title">What's waiting for you</div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Vault — every song, fully organized, free forever</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Tracker — take a song from idea to release</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Connect Spotify & YouTube to see your real numbers</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">24 integrated tools — one login</div></div>
      <div class="tool-item"><div class="tool-dot"></div><div class="tool-text">Sam, your digital manager — outbounds for you every week, you approve or deny</div></div>
    </div>

    <p>Drop your first song into the Vault and get moving:</p>

    <a href="https://soundready.ai/history" class="cta-btn">Open My Vault</a>

    <hr class="divider"/>

    <div class="footer">
      You're receiving this because you created a SoundReady account.<br/>
      Questions? Just reply to this email — we're here.<br/><br/>
      The SoundReady Team
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: "Welcome to SoundReady — your career, in motion.",
      body: htmlBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});