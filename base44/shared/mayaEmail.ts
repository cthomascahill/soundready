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

export async function sendMayaDraft({ base44, user, draft, recipient, fallbackSubject }) {
  const artistName = user.artist_name || user.full_name || 'The Artist';
  const { subject, body } = parseEmailDraft(draft, fallbackSubject);
  await base44.integrations.Core.SendEmail({
    to: recipient,
    subject,
    body: `${body}\n\n— ${artistName}\nReply directly to this email, or reach the artist at ${user.email}.`,
    from_name: `Sam for ${artistName}`,
  });
}