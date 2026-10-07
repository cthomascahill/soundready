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

export async function sendMayaDraft({ base44, user, draft, recipient, fallbackSubject, attachments = [] }) {
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
}