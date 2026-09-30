import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { jsPDF } from 'npm:jspdf@4.0.0';

const DEFAULT_APP_URL = 'https://soundready.base44.app';

const TEMPLATE_TITLES = {
  beat_lease: 'Non-Exclusive Beat Lease Agreement',
  exclusive_rights: 'Exclusive Rights Transfer Agreement',
  collab_split: 'Producer Collaboration & Split Agreement',
  nda: 'Mutual Non-Disclosure Agreement',
};

function sanitizeAppUrl(appUrl) {
  let url = appUrl || DEFAULT_APP_URL;
  if (!/^https?:\/\//.test(url)) url = DEFAULT_APP_URL;
  return url.replace(/\/+$/, '');
}

function buildPdf(contract) {
  const doc = new jsPDF();
  const templateTitle = TEMPLATE_TITLES[contract.template_type] || 'Producer Agreement';
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(templateTitle, pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Dated: ${contract.signed_at ? new Date(contract.signed_at).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US')}`, margin, y);
  y += 10;

  const facts = [
    `Between: ${contract.producer_name} ("Producer")`,
    `And: ${contract.artist_name} ("Artist")`,
    '',
    contract.beat_title ? `Beat: "${contract.beat_title}"` : null,
    contract.deal_type ? `Deal type: ${contract.deal_type}` : null,
    contract.fee != null ? `Fee: $${Number(contract.fee).toFixed(2)} USD` : null,
  ].filter(Boolean);
  for (const line of facts) {
    doc.text(line, margin, y);
    y += 7;
  }
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text('Terms', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  const termsLines = doc.splitTextToSize(contract.terms || '', pageWidth - margin * 2);
  for (const line of termsLines) {
    if (y > 250) { doc.addPage(); y = 25; }
    doc.text(line, margin, y);
    y += 6;
  }
  y += 12;

  doc.text('Agreed and e-signed via SoundReady:', margin, y);
  y += 8;
  doc.text(`Producer: ${contract.producer_name}`, margin, y);
  y += 7;
  doc.text(`Artist signature: ${contract.signed_name || contract.artist_name}`, margin, y);
  y += 7;
  doc.text(`Signed at: ${contract.signed_at ? new Date(contract.signed_at).toLocaleString('en-US') : new Date().toLocaleString('en-US')}`, margin, y);

  return doc.output('arraybuffer');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // ── Producer (auth): create a contract from a template ────────────────
    if (body.action === 'create') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const { template_type, artist_name, artist_email, beat_title, deal_type, fee, terms } = body;
      if (!template_type || !TEMPLATE_TITLES[template_type]) {
        return Response.json({ error: 'A valid template_type is required' }, { status: 400 });
      }
      if (!artist_name) return Response.json({ error: 'artist_name is required' }, { status: 400 });

      const created = await base44.entities.ProducerContract.create({
        template_type,
        producer_name: user.artist_name || user.full_name || user.email,
        producer_email: user.email,
        artist_name,
        artist_email: artist_email || undefined,
        beat_title: beat_title || undefined,
        deal_type: deal_type || undefined,
        fee: fee !== '' && fee != null ? Number(fee) : undefined,
        terms: terms || undefined,
        status: 'draft',
      });
      return Response.json({ success: true, contract: created });
    }

    // ── Producer (auth): email the signing link to the artist ──────────────
    if (body.action === 'send') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const contracts = await base44.entities.ProducerContract.filter({ id: body.contract_id }, '', 1);
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });
      if (contract.created_by_id !== user.id) return Response.json({ error: 'This contract is not yours' }, { status: 403 });
      if (!contract.artist_email) return Response.json({ error: 'Add the artist\'s email first' }, { status: 400 });
      if (contract.status === 'signed') return Response.json({ error: 'This contract is already signed' }, { status: 400 });

      const token = crypto.randomUUID();
      const appUrl = sanitizeAppUrl(body.app_url);
      const signingUrl = `${appUrl}/contracts/sign/${token}`;
      const templateTitle = TEMPLATE_TITLES[contract.template_type] || 'Agreement';

      await base44.integrations.Core.SendEmail({
        to: contract.artist_email,
        subject: `${templateTitle} from ${contract.producer_name} — signature needed`,
        body: `Hi ${contract.artist_name},\n\n${contract.producer_name} prepared a "${templateTitle}"${contract.beat_title ? ` for "${contract.beat_title}"` : ''} and needs your signature.\n\nReview and sign it here (no account needed):\n${signingUrl}\n\n— Sent via SoundReady`,
        from_name: `${contract.producer_name} via SoundReady`,
      });

      const updated = await base44.entities.ProducerContract.update(contract.id, {
        status: 'sent',
        share_token: token,
        sent_at: new Date().toISOString(),
      });
      console.log(`producerContracts: contract ${contract.id} sent to ${contract.artist_email}`);
      return Response.json({ success: true, contract: updated });
    }

    // ── Public: load a contract by signing token ──────────────────────────
    if (body.action === 'get') {
      const token = body.token;
      if (!token) return Response.json({ error: 'token required' }, { status: 400 });
      const contracts = await base44.asServiceRole.entities.ProducerContract.filter({ share_token: token }, '', 1);
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'This signing link is not valid' }, { status: 404 });
      return Response.json({
        contract: {
          template_type: contract.template_type,
          template_title: TEMPLATE_TITLES[contract.template_type],
          producer_name: contract.producer_name,
          artist_name: contract.artist_name,
          beat_title: contract.beat_title,
          deal_type: contract.deal_type,
          fee: contract.fee,
          terms: contract.terms,
          status: contract.status,
          sent_at: contract.sent_at,
        },
      });
    }

    // ── Public: the artist e-signs; PDF is generated and stored ────────────
    if (body.action === 'sign') {
      const token = body.token;
      const signedName = (body.signed_name || '').trim();
      if (!token) return Response.json({ error: 'token required' }, { status: 400 });
      if (!signedName) return Response.json({ error: 'Type your full legal name to sign' }, { status: 400 });

      const contracts = await base44.asServiceRole.entities.ProducerContract.filter({ share_token: token }, '', 1);
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'This signing link is not valid' }, { status: 404 });
      if (contract.status === 'signed') return Response.json({ error: 'This agreement has already been signed' }, { status: 400 });

      const signedAt = new Date().toISOString();
      const pdfBytes = buildPdf({ ...contract, signed_name: signedName, signed_at: signedAt });

      const pdfFile = new File([pdfBytes], 'signed-contract.pdf', { type: 'application/pdf' });
      const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: pdfFile });

      await base44.asServiceRole.entities.ProducerContract.update(contract.id, {
        status: 'signed',
        signed_name: signedName,
        signed_at: signedAt,
        pdf_file_uri: upload.file_uri,
      });

      if (contract.producer_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: contract.producer_email,
          subject: `${contract.artist_name} signed your ${TEMPLATE_TITLES[contract.template_type] || 'agreement'}`,
          body: `It's done.\n\n${contract.artist_name} e-signed your "${TEMPLATE_TITLES[contract.template_type]}"${contract.beat_title ? ` for "${contract.beat_title}"` : ''}.\n\nOpen SoundReady → Contracts to download the signed PDF.\n\n— SoundReady`,
        });
      }

      console.log(`producerContracts: contract ${contract.id} signed by ${contract.artist_name}`);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('producerContracts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}