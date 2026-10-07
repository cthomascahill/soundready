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
  const atts = (attachments || []).filter(a => a?.filename && a?.file_url).slice(0, 5);
  if (atts.length) payload.attachments = atts;
  await base44.integrations.Core.SendEmail(payload);
}