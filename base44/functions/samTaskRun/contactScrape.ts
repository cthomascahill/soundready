// Visits a venue's website (and its booking/contact pages) and pulls out the
// publicly listed booking email. Search snippets rarely expose emails; the
// venue's own pages have them.

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JUNK = /\.(png|jpe?g|gif|webp|svg|css|js|mp3|wav)$/i;
const BAD = /(sentry\.io|wixpress\.com|squarespace\.com|example\.com|schema\.org|w3\.org|godaddy)/i;
const CONTACT_LINK = /(book|contact|shows|press|submis|hire|inquir)/i;

function extractEmails(html) {
  const found = new Set();
  for (const m of String(html || '').matchAll(EMAIL_RE)) {
    const e = m[0].toLowerCase();
    if (JUNK.test(e) || BAD.test(e)) continue;
    found.add(e);
  }
  return [...found];
}

function contactPages(html, baseUrl) {
  const baseHost = new URL(baseUrl).hostname.replace(/^www\./, '');
  const links = new Set();
  for (const m of String(html || '').matchAll(/href=["']([^"']+)["']/gi)) {
    const href = m[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (!CONTACT_LINK.test(decodeURIComponent(href))) continue;
    try {
      const u = new URL(href, baseUrl);
      const host = u.hostname.replace(/^www\./, '');
      if (!host.includes(baseHost) && !baseHost.includes(host)) continue;
      links.add(u.toString());
    } catch {}
  }
  return [...links].slice(0, 3);
}

async function fetchPage(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoundReadyBot/1.0)', Accept: 'text/html' },
    redirect: 'follow',
  });
  if (!res.ok) return '';
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('html') && !ct.includes('text')) return '';
  return await res.text();
}

// Returns { email, found_on } — empty email when nothing public is listed.
export async function huntBookingEmail(website) {
  const out = { email: '', found_on: '' };
  let root;
  try {
    root = new URL(String(website).startsWith('http') ? website : `https://${website}`).toString();
  } catch {
    return out;
  }

  let html = '';
  try { html = await fetchPage(root); } catch { return out; }

  const found = extractEmails(html).map(e => ({ e, page: root }));

  const subPages = contactPages(html, root).slice(0, 2);
  const subs = await Promise.allSettled(subPages.map(async p => ({ p, html: await fetchPage(p) })));
  for (const s of subs) {
    if (s.status === 'fulfilled') {
      for (const e of extractEmails(s.value.html)) found.push({ e, page: s.value.p });
    }
  }

  if (!found.length) return out;

  const score = ({ e }) => (/^(book|booking|shows?|gig|talent|contact|press|info|hello|mgmt|hire)/.test(e) ? 2 : 1);
  found.sort((a, b) => score(b) - score(a));
  out.email = found[0].e;
  out.found_on = found[0].page;
  return out;
}