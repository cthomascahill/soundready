import { Music2, Scale, Mic2, Users, MapPin, Film, Drum, Guitar, Music4 } from "lucide-react";

// Music industry contract templates used by the Legal page. Each template
// defines its form fields and a generate() function that produces the plain
// text of the agreement from the filled-in fields.

export const TEMPLATES = [
  {
    id: "song_splits",
    icon: Music2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Song Split Agreement",
    description: "Define ownership percentages between songwriters, producers, and co-writers for master and publishing rights.",
    fields: [
      { key: "song_title", label: "Song Title", placeholder: "e.g. Midnight Run" },
      { key: "artist_name", label: "Artist / Band Name", placeholder: "e.g. Sam Lane" },
      { key: "recording_date", label: "Recording Date", placeholder: "e.g. April 15, 2026" },
      { key: "contributor_1_name", label: "Contributor 1 Name", placeholder: "e.g. John Smith" },
      { key: "contributor_1_role", label: "Contributor 1 Role", placeholder: "e.g. Lead Songwriter" },
      { key: "contributor_1_split", label: "Contributor 1 Split %", placeholder: "e.g. 50" },
      { key: "contributor_2_name", label: "Contributor 2 Name", placeholder: "e.g. Jane Doe" },
      { key: "contributor_2_role", label: "Contributor 2 Role", placeholder: "e.g. Producer" },
      { key: "contributor_2_split", label: "Contributor 2 Split %", placeholder: "e.g. 50" },
      { key: "pro_name", label: "PRO (ASCAP / BMI / SESAC)", placeholder: "e.g. ASCAP" },
    ],
    generate: (f) => `SONG SPLIT AGREEMENT

This Song Split Agreement ("Agreement") is entered into as of ${f.recording_date || "[DATE]"} by and between the following parties (collectively, the "Contributors"):

SONG INFORMATION
Song Title: ${f.song_title || "[SONG TITLE]"}
Artist / Band: ${f.artist_name || "[ARTIST NAME]"}
Recording Date: ${f.recording_date || "[DATE]"}

OWNERSHIP SPLITS

Contributor 1:
  Name: ${f.contributor_1_name || "[NAME]"}
  Role: ${f.contributor_1_role || "[ROLE]"}
  Ownership Share: ${f.contributor_1_split || "[X]"}%

Contributor 2:
  Name: ${f.contributor_2_name || "[NAME]"}
  Role: ${f.contributor_2_role || "[ROLE]"}
  Ownership Share: ${f.contributor_2_split || "[X]"}%

Total: 100%

TERMS & CONDITIONS

1. PUBLISHING RIGHTS. The above splits apply to both the master recording and the underlying composition (publishing), unless otherwise specified in a separate agreement.

2. PRO REGISTRATION. Each contributor is responsible for registering their share with their respective Performing Rights Organization (PRO). Designated PRO: ${f.pro_name || "[PRO NAME]"}.

3. ROYALTY COLLECTION. All royalties, including mechanical, performance, sync, and digital royalties, shall be divided in accordance with the ownership percentages above.

4. CREDIT. Each contributor shall receive appropriate credit on all commercial releases, streaming platforms, and promotional materials.

5. MODIFICATIONS. This Agreement may only be amended by a written document signed by all Contributors.

6. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

7. ENTIRE AGREEMENT. This Agreement constitutes the entire agreement between the parties with respect to the subject matter herein.

SIGNATURES

By signing below, each party acknowledges they have read, understood, and agreed to the terms of this Agreement.

Contributor 1: ___________________________ Date: ___________
  ${f.contributor_1_name || "[NAME]"}

Contributor 2: ___________________________ Date: ___________
  ${f.contributor_2_name || "[NAME]"}
`,
  },
  {
    id: "copyright",
    icon: Scale,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Copyright Assignment Agreement",
    description: "Transfer or license copyright ownership of a musical composition or master recording from one party to another.",
    fields: [
      { key: "song_title", label: "Song Title", placeholder: "e.g. Midnight Run" },
      { key: "assignor_name", label: "Assignor Name (Current Owner)", placeholder: "e.g. John Smith" },
      { key: "assignee_name", label: "Assignee Name (Receiving Ownership)", placeholder: "e.g. Indie Label LLC" },
      { key: "assignment_type", label: "Assignment Type", placeholder: "e.g. Full Assignment / Exclusive License" },
      { key: "territory", label: "Territory", placeholder: "e.g. Worldwide" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
      { key: "consideration", label: "Consideration (Payment)", placeholder: "e.g. $500 USD / Royalty Share" },
    ],
    generate: (f) => `COPYRIGHT ASSIGNMENT AGREEMENT

This Copyright Assignment Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

ASSIGNOR (Current Copyright Owner):
  Name: ${f.assignor_name || "[ASSIGNOR NAME]"}

ASSIGNEE (Receiving Party):
  Name: ${f.assignee_name || "[ASSIGNEE NAME]"}

WORK COVERED
  Song Title: ${f.song_title || "[SONG TITLE]"}
  Type of Assignment: ${f.assignment_type || "[FULL ASSIGNMENT / EXCLUSIVE LICENSE]"}
  Territory: ${f.territory || "Worldwide"}
  Effective Date: ${f.effective_date || "[DATE]"}

TERMS & CONDITIONS

1. ASSIGNMENT. For good and valuable consideration of ${f.consideration || "[CONSIDERATION]"}, the receipt and sufficiency of which is hereby acknowledged, Assignor hereby irrevocably assigns, transfers, and conveys to Assignee all right, title, and interest in and to the copyright in the Work identified above, including all renewal and extension rights.

2. SCOPE. This assignment includes, but is not limited to: the right to reproduce, distribute, publicly perform, publicly display, create derivative works, and sublicense the Work.

3. WARRANTIES. Assignor warrants that: (a) Assignor is the sole owner of the copyright in the Work; (b) the Work does not infringe upon any third-party rights; (c) Assignor has full authority to enter into this Agreement.

4. MORAL RIGHTS. To the extent permitted by applicable law, Assignor hereby waives all moral rights in the Work.

5. FURTHER ASSURANCES. Assignor agrees to execute any additional documents necessary to complete the transfer of copyright as contemplated herein.

6. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Assignor: ___________________________ Date: ___________
  ${f.assignor_name || "[ASSIGNOR NAME]"}

Assignee: ___________________________ Date: ___________
  ${f.assignee_name || "[ASSIGNEE NAME]"}
`,
  },
  {
    id: "producer",
    icon: Mic2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Producer Agreement",
    description: "Define the relationship between an artist and producer — including beat licensing, royalty splits, credits, and deliverables.",
    fields: [
      { key: "song_title", label: "Song / Project Title", placeholder: "e.g. Midnight Run" },
      { key: "artist_name", label: "Artist Name", placeholder: "e.g. Sam Lane" },
      { key: "producer_name", label: "Producer Name", placeholder: "e.g. DJ Beats" },
      { key: "producer_split", label: "Producer Royalty Split %", placeholder: "e.g. 20" },
      { key: "artist_split", label: "Artist Royalty Split %", placeholder: "e.g. 80" },
      { key: "upfront_fee", label: "Upfront Producer Fee", placeholder: "e.g. $500 / $0" },
      { key: "deliverable_date", label: "Beat / Stems Delivery Date", placeholder: "e.g. April 20, 2026" },
      { key: "exclusive", label: "Exclusive or Non-Exclusive Beat", placeholder: "e.g. Exclusive" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `PRODUCER AGREEMENT

This Producer Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

ARTIST:
  Name: ${f.artist_name || "[ARTIST NAME]"}

PRODUCER:
  Name: ${f.producer_name || "[PRODUCER NAME]"}

PROJECT DETAILS
  Song / Project: ${f.song_title || "[SONG TITLE]"}
  Beat License Type: ${f.exclusive || "[EXCLUSIVE / NON-EXCLUSIVE]"}
  Upfront Producer Fee: ${f.upfront_fee || "[AMOUNT]"}
  Deliverable Date: ${f.deliverable_date || "[DATE]"}

ROYALTY SPLITS
  Artist: ${f.artist_split || "[X]"}%
  Producer: ${f.producer_split || "[X]"}%
  Total: 100%

TERMS & CONDITIONS

1. SERVICES. Producer agrees to deliver a fully produced instrumental beat and all associated stems (drums, bass, melody, etc.) by ${f.deliverable_date || "[DATE]"} in WAV format at 24-bit/48kHz minimum.

2. LICENSE. Producer grants Artist a ${f.exclusive || "[exclusive/non-exclusive]"} license to use the Beat for the recording and commercial release of "${f.song_title || "[SONG TITLE]"}." This includes streaming, download, radio play, sync, and live performance.

3. COMPENSATION. In consideration for Producer's services, Artist agrees to: (a) pay an upfront fee of ${f.upfront_fee || "[AMOUNT]"} upon execution of this Agreement; and (b) pay Producer ${f.producer_split || "[X]"}% of net master royalties generated from the recording.

4. PUBLISHING. Producer shall be entitled to ${f.producer_split || "[X]"}% of the publishing/composition share of the Work.

5. CREDIT. Producer shall receive written credit on all commercial releases as: "Produced by ${f.producer_name || "[PRODUCER NAME]"}."

6. OWNERSHIP. The master recording shall be jointly owned in accordance with the royalty splits above, unless otherwise agreed. The underlying composition shall be split as above.

7. WARRANTIES. Each party warrants they have full authority to enter this Agreement and that their contributions do not infringe third-party rights.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Artist: ___________________________ Date: ___________
  ${f.artist_name || "[ARTIST NAME]"}

Producer: ___________________________ Date: ___________
  ${f.producer_name || "[PRODUCER NAME]"}
`,
  },
  {
    id: "collab",
    icon: Users,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "Collaboration Agreement",
    description: "A general-purpose agreement between two or more artists collaborating on a joint project, defining creative contributions and revenue sharing.",
    fields: [
      { key: "project_title", label: "Project / Song Title", placeholder: "e.g. Summer Sessions EP" },
      { key: "party_1_name", label: "Party 1 Name", placeholder: "e.g. Sam Lane" },
      { key: "party_1_role", label: "Party 1 Role", placeholder: "e.g. Lead Artist / Vocalist" },
      { key: "party_2_name", label: "Party 2 Name", placeholder: "e.g. Alex Rowe" },
      { key: "party_2_role", label: "Party 2 Role", placeholder: "e.g. Featured Artist" },
      { key: "revenue_split", label: "Revenue Split", placeholder: "e.g. 60/40 or 50/50" },
      { key: "release_platform", label: "Release Platform", placeholder: "e.g. Spotify, Apple Music, all DSPs" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `COLLABORATION AGREEMENT

This Collaboration Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

Party 1:
  Name: ${f.party_1_name || "[PARTY 1]"}
  Role: ${f.party_1_role || "[ROLE]"}

Party 2:
  Name: ${f.party_2_name || "[PARTY 2]"}
  Role: ${f.party_2_role || "[ROLE]"}

PROJECT DETAILS
  Project / Song Title: ${f.project_title || "[PROJECT TITLE]"}
  Release Platform(s): ${f.release_platform || "[PLATFORMS]"}
  Revenue Split: ${f.revenue_split || "[SPLIT]"}
  Effective Date: ${f.effective_date || "[DATE]"}

TERMS & CONDITIONS

1. COLLABORATIVE WORK. The parties agree to collaborate on the creation of "${f.project_title || "[PROJECT]"}" (the "Work"). Each party shall contribute their respective creative services as outlined above.

2. OWNERSHIP. The parties shall jointly own the Work in accordance with their revenue split (${f.revenue_split || "[SPLIT]"}), unless otherwise specified.

3. REVENUE SHARING. All net revenue generated from the Work — including streaming royalties, sync fees, master royalties, and live performance royalties — shall be split ${f.revenue_split || "[SPLIT]"} between Party 1 and Party 2.

4. CREDIT. Both parties shall receive credit on all commercial releases and promotional materials.

5. DECISION MAKING. Major decisions regarding the Work (including licensing, remixing, and commercial use) require mutual written consent from all parties.

6. TERMINATION. This Agreement may only be terminated by mutual written consent of all parties.

7. DISPUTE RESOLUTION. Any disputes arising under this Agreement shall first be subject to good-faith negotiation between the parties for a period of 30 days before any legal action is initiated.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Party 1: ___________________________ Date: ___________
  ${f.party_1_name || "[PARTY 1 NAME]"}

Party 2: ___________________________ Date: ___________
  ${f.party_2_name || "[PARTY 2 NAME]"}
`,
  },
  {
    id: "performance",
    icon: MapPin,
    color: "text-cyan-400",
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/20",
    title: "Performance / Booking Agreement",
    description: "Book a live show: performance details, guarantee and door split, sound and equipment, cancellation, and merchandise terms.",
    fields: [
      { key: "artist_name", label: "Artist / Band Name", placeholder: "e.g. Sam Lane" },
      { key: "venue_name", label: "Venue Name", placeholder: "e.g. The Blue Note" },
      { key: "venue_city", label: "Venue City / State", placeholder: "e.g. Denver, CO" },
      { key: "event_date", label: "Event Date", placeholder: "e.g. May 2, 2026" },
      { key: "set_length", label: "Set Length", placeholder: "e.g. 60 minutes" },
      { key: "soundcheck_time", label: "Soundcheck Time", placeholder: "e.g. 6:00 PM" },
      { key: "guarantee", label: "Guarantee (Flat Fee)", placeholder: "e.g. $300 / $0" },
      { key: "door_split", label: "Door Split", placeholder: "e.g. 70% artist / 30% venue after $0" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `PERFORMANCE / BOOKING AGREEMENT

This Performance Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

ARTIST:
  Name: ${f.artist_name || "[ARTIST NAME]"}

VENUE / PURCHASER:
  Name: ${f.venue_name || "[VENUE NAME]"}
  Location: ${f.venue_city || "[CITY, STATE]"}

EVENT DETAILS
  Event Date: ${f.event_date || "[DATE]"}
  Performance Length: ${f.set_length || "[SET LENGTH]"}
  Soundcheck: ${f.soundcheck_time || "[TIME]"}

COMPENSATION
  Guarantee: ${f.guarantee || "[AMOUNT]"}
  Door Split: ${f.door_split || "[SPLIT]"}

TERMS & CONDITIONS

1. PERFORMANCE. Artist agrees to perform a live musical performance of approximately ${f.set_length || "[SET LENGTH]"} at ${f.venue_name || "[VENUE NAME]"} on ${f.event_date || "[DATE]"}, beginning no later than the time designated by Venue.

2. COMPENSATION. Venue shall pay Artist a guarantee of ${f.guarantee || "[AMOUNT]"}, plus ${f.door_split || "[DOOR SPLIT]"} of net door receipts (if applicable), payable in full at the conclusion of the performance.

3. SOUND AND EQUIPMENT. Venue shall provide a functioning sound system, a sound engineer, reasonable stage lighting, and safe access to power. Artist shall provide all instruments and performance equipment unless otherwise agreed in writing.

4. SOUND CHECK AND LOAD-IN. Artist shall be granted access to the performance space for sound check and load-in no later than ${f.soundcheck_time || "[TIME]"} on the day of the event.

5. PROMOTION. Both parties agree to make reasonable efforts to promote the event. Venue shall list the event on its public calendar.

6. MERCHANDISE. Artist shall be permitted to sell merchandise at the venue, retaining 100% of merchandise revenue unless otherwise agreed in writing.

7. CANCELLATION. If Artist cancels within 14 days of the event date, Artist shall forfeit the guarantee unless a substitute date is agreed. If Venue cancels for reasons other than force majeure, Venue shall pay Artist 50% of the guarantee. Neither party is liable for failure to perform due to force majeure events.

8. RECORDING AND MEDIA. No audio or video recording, photography for commercial use, or livestream of the performance shall be made without Artist's prior written consent. Artist grants Venue the right to use Artist's name, likeness, and approved promotional materials for the purpose of promoting this event only.

9. CONDUCT AND SAFETY. Venue shall maintain a safe environment in accordance with all applicable laws and shall retain security as appropriate for the event.

10. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Artist: ___________________________ Date: ___________
  ${f.artist_name || "[ARTIST NAME]"}

For Venue: ___________________________ Date: ___________
  ${f.venue_name || "[VENUE NAME]"}
`,
  },
  {
    id: "sync_license",
    icon: Film,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Sync License Agreement",
    description: "License a song for use in film, TV, advertising, or video games — covering media, territory, term, and the sync fee.",
    fields: [
      { key: "song_title", label: "Song Title", placeholder: "e.g. Midnight Run" },
      { key: "licensor_name", label: "Licensor (Song Owner)", placeholder: "e.g. Sam Lane" },
      { key: "licensee_name", label: "Licensee (Production Company)", placeholder: "e.g. Bright Frame Films LLC" },
      { key: "production_title", label: "Production Title", placeholder: "e.g. Night Drive (feature film)" },
      { key: "media_type", label: "Media / Use", placeholder: "e.g. Film, TV, advertising, video game" },
      { key: "territory", label: "Territory", placeholder: "e.g. Worldwide" },
      { key: "license_term", label: "License Term", placeholder: "e.g. 3 years / In perpetuity" },
      { key: "sync_fee", label: "Sync Fee (One-Time Payment)", placeholder: "e.g. $1,000 USD" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `SYNC LICENSE AGREEMENT

This Sync License Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

LICENSOR (Owner of the Composition and Master):
  Name: ${f.licensor_name || "[LICENSOR NAME]"}

LICENSEE (Production Company):
  Name: ${f.licensee_name || "[LICENSEE NAME]"}

WORK AND USE
  Song Title: ${f.song_title || "[SONG TITLE]"}
  Production: ${f.production_title || "[PRODUCTION TITLE]"}
  Media / Use: ${f.media_type || "[MEDIA TYPE]"}
  Territory: ${f.territory || "Worldwide"}
  License Term: ${f.license_term || "[TERM]"}

TERMS & CONDITIONS

1. GRANT OF LICENSE. Licensor grants Licensee a non-exclusive, ${f.license_term || "[TERM]"} license to synchronize, reproduce, publicly perform, and distribute the composition and master recording of "${f.song_title || "[SONG TITLE]"}" (the "Work") in connection with ${f.production_title || "[PRODUCTION TITLE]"}, in the media of ${f.media_type || "[MEDIA TYPE]"}, within ${f.territory || "Worldwide"}.

2. SYNC FEE. Licensee shall pay Licensor a one-time, non-refundable sync fee of ${f.sync_fee || "[AMOUNT]"}, payable upon execution of this Agreement. The sync fee covers all uses of the Work granted herein, including festival submissions and awards consideration for the Production.

3. OWNERSHIP. Licensor retains all ownership of the Work. No ownership rights are transferred by this Agreement. Licensee may not assign or sublicense the rights granted herein except in connection with the distribution and exhibition of the Production.

4. CREDITS. Licensee shall accord credit to Licensor in the end titles of the Production as follows: "${f.song_title || "[SONG TITLE]"} — Written and Performed by ${f.licensor_name || "[LICENSOR NAME]"}."

5. DERIVATIVE USE. Licensee may edit, loop, or adapt the Work as needed for timing and creative purposes in the Production, provided such use does not disparage Licensor.

6. WARRANTIES. Licensor warrants that: (a) Licensor controls 100% of the composition and master; (b) the Work does not infringe any third-party rights; (c) no samples requiring clearance are contained in the Work. Licensee warrants it has full authority to enter this Agreement for the Production.

7. NO OTHER RIGHTS. All rights not expressly granted herein are reserved by Licensor, including the right to license the Work to other productions.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Licensor: ___________________________ Date: ___________
  ${f.licensor_name || "[LICENSOR NAME]"}

For Licensee: ___________________________ Date: ___________
  ${f.licensee_name || "[LICENSEE NAME]"}
`,
  },
  {
    id: "beat_lease",
    icon: Drum,
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    title: "Beat Lease Agreement",
    description: "Lease a beat non-exclusively: distribution caps, term, monetization limits, and producer credit — the standard indie lease deal.",
    fields: [
      { key: "beat_title", label: "Beat Title", placeholder: "e.g. Midnight Run (Instrumental)" },
      { key: "producer_name", label: "Producer Name", placeholder: "e.g. DJ Beats" },
      { key: "artist_name", label: "Artist / Lessee Name", placeholder: "e.g. Sam Lane" },
      { key: "lease_fee", label: "Lease Fee (One-Time)", placeholder: "e.g. $30" },
      { key: "stream_cap", label: "Streaming / Sales Cap", placeholder: "e.g. 10,000 streams / 2,500 sales" },
      { key: "term_length", label: "Lease Term", placeholder: "e.g. 2 years" },
      { key: "music_video_count", label: "Music Videos Allowed", placeholder: "e.g. 1" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `BEAT LEASE AGREEMENT (NON-EXCLUSIVE)

This Beat Lease Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} between:

PRODUCER (Owner of the Beat):
  Name: ${f.producer_name || "[PRODUCER NAME]"}

ARTIST (Lessee):
  Name: ${f.artist_name || "[ARTIST NAME]"}

BEAT AND TERMS
  Beat Title: ${f.beat_title || "[BEAT TITLE]"}
  Lease Fee: ${f.lease_fee || "[AMOUNT]"}
  Lease Term: ${f.term_length || "[TERM]"}
  Streaming / Sales Cap: ${f.stream_cap || "[CAP]"}
  Music Videos Allowed: ${f.music_video_count || "[COUNT]"}

TERMS & CONDITIONS

1. GRANT OF LEASE. Producer grants Artist a non-exclusive, non-transferable license to record vocals over and commercially release the beat "${f.beat_title || "[BEAT TITLE]"}" (the "Beat") for a period of ${f.term_length || "[TERM]"} from the Effective Date.

2. LEASE FEE. Artist shall pay Producer a one-time fee of ${f.lease_fee || "[AMOUNT]"}, which grants the rights described herein. No royalties are payable to Producer under this lease beyond this fee.

3. USAGE LIMITS. Artist may distribute the recorded song on all major streaming platforms and online stores, subject to a combined cap of ${f.stream_cap || "[CAP]"}. Artist may release up to ${f.music_video_count || "[COUNT]"} music video(s) using the Beat, which may be monetized on YouTube. Radio play and television broadcasting are not permitted under this lease.

4. NON-EXCLUSIVE RIGHTS. Producer retains full ownership of the Beat and may lease or sell it to other artists. This lease does not prevent Producer from licensing the Beat elsewhere.

5. CREDIT. Artist shall credit Producer on all releases as: "Prod. ${f.producer_name || "[PRODUCER NAME]"}".

6. CAP EXCEEDED. If Artist exceeds the streaming/sales cap, Artist must upgrade to an exclusive rights agreement or renew this lease before continuing distribution.

7. DERIVATIVE WORK. Artist's vocal recording over the Beat is jointly owned by Artist (vocals) and Producer (instrumental). Artist may not resell, redistribute, or register the Beat alone with any content ID or copyright system.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Producer: ___________________________ Date: ___________
  ${f.producer_name || "[PRODUCER NAME]"}

Artist: ___________________________ Date: ___________
  ${f.artist_name || "[ARTIST NAME]"}
`,
  },
  {
    id: "session_musician",
    icon: Guitar,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    title: "Session Musician Agreement (Work-for-Hire)",
    description: "Hire a session player or vocalist for a flat fee — the recordings are work-for-hire, with agreed credit and no future royalties.",
    fields: [
      { key: "musician_name", label: "Musician / Vocalist Name", placeholder: "e.g. Alex Rowe" },
      { key: "instrument", label: "Instrument / Service", placeholder: "e.g. Electric guitar, backing vocals" },
      { key: "artist_name", label: "Artist / Hiring Party", placeholder: "e.g. Sam Lane" },
      { key: "song_title", label: "Song Title", placeholder: "e.g. Midnight Run" },
      { key: "session_date", label: "Session Date", placeholder: "e.g. April 15, 2026" },
      { key: "session_fee", label: "Session Fee (Flat)", placeholder: "e.g. $150" },
      { key: "rehearsals", label: "Rehearsals / Shows Included", placeholder: "e.g. 1 rehearsal / none" },
      { key: "credit_line", label: "Agreed Credit", placeholder: "e.g. 'Guitar: Alex Rowe'" },
    ],
    generate: (f) => `SESSION MUSICIAN AGREEMENT (WORK-FOR-HIRE)

This Session Musician Agreement ("Agreement") is entered into as of ${f.session_date || "[DATE]"} between:

ARTIST / HIRING PARTY:
  Name: ${f.artist_name || "[ARTIST NAME]"}

MUSICIAN:
  Name: ${f.musician_name || "[MUSICIAN NAME]"}
  Instrument / Service: ${f.instrument || "[INSTRUMENT]"}

ENGAGEMENT
  Song Title: ${f.song_title || "[SONG TITLE]"}
  Session Date: ${f.session_date || "[DATE]"}
  Session Fee: ${f.session_fee || "[AMOUNT]"}
  Rehearsals / Live Shows: ${f.rehearsals || "[DETAILS]"}
  Agreed Credit: ${f.credit_line || "[CREDIT]"}

TERMS & CONDITIONS

1. SERVICES. Musician agrees to perform and record ${f.instrument || "[INSTRUMENT]"} on the recording of "${f.song_title || "[SONG TITLE]"}" on ${f.session_date || "[DATE]"}, and where agreed, at ${f.rehearsals || "[DETAILS]"}.

2. WORK-FOR-HIRE. All recordings, performances, and contributions created by Musician under this Agreement are specially ordered or commissioned by Artist as works made for hire. Artist exclusively owns all rights, title, and interest in and to such recordings, including the copyright therein, from the moment of their creation.

3. COMPENSATION. Artist shall pay Musician a flat fee of ${f.session_fee || "[AMOUNT]"} for the services described, payable upon completion of the session. This fee constitutes full and final compensation; Musician is not entitled to any royalties, points, or future income from the recordings.

4. CREDIT. Where the recording is commercially released, Artist shall accord Musician credit as follows: ${f.credit_line || "[CREDIT]"}. Credit is courtesy only and does not confer ownership.

5. WARRANTIES. Musician warrants that their performance does not infringe any third-party rights and that they have no conflicting obligations preventing performance of this Agreement.

6. EQUIPMENT. Musician shall provide their own instrument(s) unless otherwise agreed. Artist shall provide studio access and any agreed technical support.

7. NO FURTHER OBLIGATIONS. Neither party is obligated to engage the other for future sessions, releases, or performances beyond those listed above.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Artist: ___________________________ Date: ___________
  ${f.artist_name || "[ARTIST NAME]"}

Musician: ___________________________ Date: ___________
  ${f.musician_name || "[MUSICIAN NAME]"}
`,
  },
  {
    id: "band_members",
    icon: Music4,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    title: "Band Member Agreement",
    description: "Set the ground rules inside a band: name ownership, revenue splits, decision-making, and what happens when someone leaves.",
    fields: [
      { key: "band_name", label: "Band Name", placeholder: "e.g. The Midnight Run" },
      { key: "member_1_name", label: "Member 1 Name", placeholder: "e.g. Sam Lane" },
      { key: "member_1_role", label: "Member 1 Role", placeholder: "e.g. Lead vocals, guitar" },
      { key: "member_2_name", label: "Member 2 Name", placeholder: "e.g. Alex Rowe" },
      { key: "member_2_role", label: "Member 2 Role", placeholder: "e.g. Drums" },
      { key: "revenue_split", label: "Revenue Split", placeholder: "e.g. Equal shares / 50/50" },
      { key: "name_ownership", label: "Band Name Ownership", placeholder: "e.g. Jointly owned / retained by founding member" },
      { key: "effective_date", label: "Effective Date", placeholder: "e.g. April 15, 2026" },
    ],
    generate: (f) => `BAND MEMBER AGREEMENT

This Band Member Agreement ("Agreement") is entered into as of ${f.effective_date || "[DATE]"} among the following members of the band "${f.band_name || "[BAND NAME]"}" (the "Band"):

Member 1:
  Name: ${f.member_1_name || "[NAME]"}
  Role: ${f.member_1_role || "[ROLE]"}

Member 2:
  Name: ${f.member_2_name || "[NAME]"}
  Role: ${f.member_2_role || "[ROLE]"}

TERMS & CONDITIONS

1. PURPOSE. The parties agree to perform, record, and release music together as the Band, and this Agreement sets out how the Band operates, how money is shared, and what happens if a member leaves.

2. BAND NAME. The name "${f.band_name || "[BAND NAME]"}" is ${f.name_ownership || "[JOINTLY OWNED / RETAINED BY FOUNDING MEMBER]"}. No member may license or use the Band name for outside projects without written consent of the other members.

3. REVENUE. All net revenue earned by the Band — including recording royalties, performance fees, merchandise, and sync income — shall be divided as follows: ${f.revenue_split || "[SPLIT]"}, after deduction of Band expenses approved under this Agreement.

4. SONGWRITING. Songwriting ownership for any song is governed by a separate Song Split Agreement for that song; unless a split sheet says otherwise, Band-owned songs are credited and divided per the revenue split above.

5. DECISIONS. Day-to-day decisions may be made by any member; major decisions — releasing a recording, signing any agreement, hiring or dismissing a member, spending over $[AMOUNT], or licensing the Band name — require unanimous written consent of all members.

6. EXPENSES. Band expenses (recording, gear, van, promotion) are paid from Band revenue first, with each member responsible for their own personal instruments unless otherwise agreed.

7. DEPARTURE. A member who leaves or is dismissed (by unanimous consent of the remaining members for cause) retains: (a) their share of revenue already earned through the date of departure, payable per the normal split; and (b) their writer's share of any songs they co-wrote. A departing member grants the remaining members the right to continue performing the Band's existing repertoire, and does not gain any right to the Band name except as stated in Clause 2.

8. NEW MEMBERS. Any new member must sign this Agreement (or its successor) before performing or recording with the Band.

9. DISPUTES. Any dispute shall first be submitted to good-faith mediation before any legal action.

10. GOVERNING LAW. This Agreement shall be governed by the laws of the State of [STATE].

SIGNATURES

Member 1: ___________________________ Date: ___________
  ${f.member_1_name || "[NAME]"}

Member 2: ___________________________ Date: ___________
  ${f.member_2_name || "[NAME]"}
`,
  },
];