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
    <html lang="en" style="background-color:#0a0a0a;">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <!-- Declaring the email dark-only tells Gmail and Apple Mail to render the
       dark palette as-is instead of inverting it into a white background
       with light, unreadable text. -->
    <meta name="color-scheme" content="only dark"/>
    <meta name="supported-color-schemes" content="only dark"/>
    <title>Your career, in motion.</title>
    <style>
    @media (prefers-color-scheme: light) {
      html, body, .dark-bg { background-color:#0a0a0a !important; }
    }
    </style>
    </head>
    <body style="margin:0; padding:0; background-color:#0a0a0a;">
    <table role="presentation" class="dark-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0a0a" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:0 20px 40px;">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:580px;">

          <tr>
            <td bgcolor="#21c45d" style="background-color:#21c45d; padding:20px 24px;">
              <img src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/010253974_ChatGPTImageJun11202609_02_49AM.png" alt="SoundReady" height="36" style="height:36px; display:block; border:0;" />
            </td>
          </tr>

          <tr>
            <td style="font-family:'Space Grotesk', Arial, sans-serif; font-size:34px; font-weight:900; line-height:1.1; color:#fafafa; padding:36px 24px 16px;">
              Your career,<br/><span style="color:#21c45d;">in motion.</span>
            </td>
          </tr>

          <tr>
            <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#bdbdbd; line-height:1.7; padding:0 24px 24px;">
              Hey ${userName}, welcome to SoundReady. Every song, show, deal and dollar in one place, built for independent artists. Start free, no card required.
            </td>
          </tr>

          <tr>
            <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#bdbdbd; line-height:1.7; padding:0 24px;">
              To start you off right, your free Release Starter Kit is attached: the playlist pitch format that has landed songs on Spotify editorial playlists, a filled-in example, a week-by-week release timeline, and the metadata checklist most artists miss.
            </td>
          </tr>

          <tr>
            <td style="padding:28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#141414" style="background-color:#141414; border:1px solid #282828; border-radius:10px;">
                <tr>
                  <td style="font-family:'Space Grotesk', Arial, sans-serif; font-size:13px; font-weight:700; color:#21c45d; text-transform:uppercase; letter-spacing:0.08em; padding:24px 24px 16px;">
                    What's waiting for you
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td width="16" valign="top" style="padding:0 10px 12px 0;"><div style="width:6px; height:6px; background:#21c45d; border-radius:50%; margin-top:7px;"></div></td><td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d4d4d4; line-height:1.5; padding:0 0 12px;">Vault — every song, fully organized, free forever</td></tr>
                      <tr><td width="16" valign="top" style="padding:0 10px 12px 0;"><div style="width:6px; height:6px; background:#21c45d; border-radius:50%; margin-top:7px;"></div></td><td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d4d4d4; line-height:1.5; padding:0 0 12px;">Tracker — take a song from idea to release</td></tr>
                      <tr><td width="16" valign="top" style="padding:0 10px 12px 0;"><div style="width:6px; height:6px; background:#21c45d; border-radius:50%; margin-top:7px;"></div></td><td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d4d4d4; line-height:1.5; padding:0 0 12px;">Release Kit — your release checklist and pitch template, free in the app</td></tr>
                      <tr><td width="16" valign="top" style="padding:0 10px 12px 0;"><div style="width:6px; height:6px; background:#21c45d; border-radius:50%; margin-top:7px;"></div></td><td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d4d4d4; line-height:1.5; padding:0 0 12px;">Connect Spotify &amp; YouTube to see your real numbers</td></tr>
                      <tr><td width="16" valign="top" style="padding:0 10px 12px 0;"><div style="width:6px; height:6px; background:#21c45d; border-radius:50%; margin-top:7px;"></div></td><td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d4d4d4; line-height:1.5; padding:0 0 12px;">Free PDF attached — the Release Starter Kit: pitch template, filled-in example, release timeline, metadata checklist</td></tr>
                      <tr><td width="16" valign="top" style="padding:0 10px 12px 0;"><div style="width:6px; height:6px; background:#21c45d; border-radius:50%; margin-top:7px;"></div></td><td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d4d4d4; line-height:1.5; padding:0 0 12px;">24 integrated tools — one login</td></tr>
                      <tr><td width="16" valign="top" style="padding:0 10px 0 0;"><div style="width:6px; height:6px; background:#21c45d; border-radius:50%; margin-top:7px;"></div></td><td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#d4d4d4; line-height:1.5;">Sam, your digital manager — outbounds for you every week, you approve or deny</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#bdbdbd; line-height:1.7; padding:0 24px 8px;">
              Your first move: open the Release Kit and work the checklist for your next song:
            </td>
          </tr>

          <tr>
            <td style="padding:8px 24px 32px;">
              <a href="https://soundready.ai/release-kit" style="display:inline-block; background-color:#21c45d; color:#000000; font-family:'Space Grotesk', Arial, sans-serif; font-weight:700; font-size:15px; padding:14px 32px; border-radius:10px; text-decoration:none;">Open My Release Kit</a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px;">
              <div style="border-top:1px solid #282828; line-height:1px; font-size:0;">&nbsp;</div>
            </td>
          </tr>

          <tr>
            <td style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#8c8c8c; line-height:1.6; padding:24px 24px 0;">
              You're receiving this because you created a SoundReady account.<br/>
              Questions? Just reply to this email — we're here.<br/><br/>
              The SoundReady Team
            </td>
          </tr>

        </table>
      </td>
    </tr>
    </table>
    </body>
    </html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: "Welcome to SoundReady: your free Release Starter Kit is inside",
      body: htmlBody,
      attachments: [{
        filename: "SoundReady-Release-Starter-Kit.pdf",
        file_url: "https://base44.app/api/apps/69dcf0ecc907e43a438a626b/files/mp/public/69dcf0ecc907e43a438a626b/e77248d7b_SoundReady-Release-Starter-Kit.pdf",
      }],
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});