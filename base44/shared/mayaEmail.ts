// Shared helpers for Sam's outreach drafts — used by mayaSendDraft and
// mayaApprove so both approval paths send identically.

export function isValidEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((value || '').trim());
}

export function parseEmailDraft(draft, fallbackSubject) {
  const subjectMatch = (draft || '').match(/^Subject:\s*(.+)$/m);
  const subject = subjectMatch ? subjectMatch[1].trim() : (fallbackSubject || '');
  const body = (draft || '').replace(/^Subject:\s*.+$/m, '').trim();
  return { subject, body };
}

// The artist's latest saved Electronic Press Kit, so every pitch Sam sends
// arrives with the full picture attached. Silent when none is saved yet.
async function latestEpkAttachment(base44, user) {
  try {
    const epks = await base44.entities.EPK.filter({ user_id: user.id }, '-created_date', 1);
    const epk = epks[0];
    if (!epk?.file_uri) return null;
    const safe = (epk.artist_name || user.artist_name || 'Artist')
      .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'Artist';
    return { filename: `${safe}_EPK.pdf`, file_uri: epk.file_uri };
  } catch (e) {
    console.log(`mayaEmail: no EPK attached (${e.message})`);
    return null;
  }
}

export async function sendMayaDraft({ base44, user, draft, recipient, fallbackSubject, attachments = [], confirmSend = false }) {
  const artistName = user.artist_name || user.full_name || 'The Artist';
  const { subject, body } = parseEmailDraft(draft, fallbackSubject);
  const payload = {
    to: recipient,
    subject,
    body: `${body}\n\n— ${artistName}\nReply directly to this email, or reach the artist at ${user.email}.`,
    from_name: `Sam for ${artistName}`,
  };
  // Optional files the task attached (song, report) ride along with the pitch
  const atts = (attachments || []).filter(a => a?.filename && a?.file_url);
  // The artist's saved Electronic Press Kit rides along too, room permitting
  const epk = await latestEpkAttachment(base44, user);
  if (epk && atts.length < 5 && !atts.some(a => a.file_url === epk.file_uri)) atts.push(epk);
  if (atts.length) payload.attachments = atts;
  await base44.integrations.Core.SendEmail(payload);

  // Proof of send: a branded copy of exactly what went out lands in the artist's inbox
  if (confirmSend && user.email) {
    try {
      const esc = (s) => String(s || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background-color:#0a0a0a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;">
<tr><td align="center" style="padding:0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
<tr><td style="background-color:#21c45d;padding:22px 36px;border-radius:10px 10px 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px;"><img src="https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/010253974_ChatGPTImageJun11202609_02_49AM.png" alt="SoundReady" width="36" style="display:block;border:0;" /></td>
<td style="font-family:'Space Grotesk',Arial,sans-serif;font-size:18px;font-weight:700;color:#000000;">SoundReady</td>
</tr></table>
</td></tr>
<tr><td style="padding:36px 36px 8px;font-family:'Space Grotesk',Arial,sans-serif;">
<h1 style="margin:0 0 10px;font-size:28px;line-height:1.15;color:#fafafa;">Sam sent your pitch.</h1>
<p style="margin:0;font-size:14px;color:#a3a3a3;">It just went out on your behalf. Here is the confirmation:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 0;width:100%;">
<tr><td style="padding:6px 12px;background-color:#0f1411;border:1px solid #1f2937;border-radius:8px 0 0 8px;font-size:13px;color:#a3a3a3;font-family:'Space Grotesk',Arial,sans-serif;width:90px;">To</td><td style="padding:6px 12px;background-color:#0f1411;border:1px solid #1f2937;border-radius:0 8px 8px 0;font-size:13px;color:#fafafa;font-family:'Space Grotesk',Arial,sans-serif;">${esc(recipient)}</td></tr>
<tr><td colspan="2" style="height:6px;"></td></tr>
<tr><td style="padding:6px 12px;background-color:#0f1411;border:1px solid #1f2937;border-radius:8px 0 0 8px;font-size:13px;color:#a3a3a3;font-family:'Space Grotesk',Arial,sans-serif;width:90px;">Subject</td><td style="padding:6px 12px;background-color:#0f1411;border:1px solid #1f2937;border-radius:0 8px 8px 0;font-size:13px;color:#fafafa;font-family:'Space Grotesk',Arial,sans-serif;">${esc(subject)}</td></tr>
</table>
<p style="margin:22px 0 8px;font-size:12px;color:#21c45d;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;font-family:'Space Grotesk',Arial,sans-serif;">The email exactly as it went out</p>
<div style="background-color:#0f1411;border:1px solid #1f2937;border-radius:10px;padding:16px;font-size:13px;line-height:1.6;color:#fafafa;font-family:'Space Grotesk',Arial,sans-serif;white-space:pre-wrap;">${esc(draft)}</div>
</td></tr>
<tr><td style="padding:28px 36px 8px;font-family:'Space Grotesk',Arial,sans-serif;">
<a href="https://soundready.ai/maya-desk" style="display:inline-block;background-color:#21c45d;color:#000000;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;">Open Sam's Desk</a>
</td></tr>
<tr><td style="padding:24px 36px 32px;font-family:'Space Grotesk',Arial,sans-serif;">
<p style="margin:0 0 4px;font-size:12px;color:#a3a3a3;">Sam · Your AI manager, on it.</p>
<p style="margin:0;font-size:12px;color:#a3a3a3;"><a href="https://soundready.ai" style="color:#21c45d;">soundready.ai</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Sam sent your pitch: "${subject}"`,
        html,
        text: `Sam just sent this pitch on your behalf.\n\nTo: ${recipient}\nSubject: ${subject}\n\nBelow is the email exactly as it went out:\n\n${draft}`,
        from_name: `Sam for ${artistName}`,
      });
    } catch (e) {
      console.log(`mayaEmail: confirmation copy to artist failed (${e.message})`);
    }
  }
}