import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SONG_FIELDS = [
  "stage_write", "stage_record", "stage_mix", "stage_master",
  "stage_review", "stage_artwork", "stage_submit", "stage_released",
];

// Lets a teammate invited by an artist view that artist's Tracker read-only:
//  - "list-mine": which artists invited the current user (emails matched on TeamMember)
//  - "get": the owner's projects + songs, with signed URLs for mix files
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, owner_id } = await req.json().catch(() => ({}));

    if (action === 'list-mine') {
      const memberships = await base44.asServiceRole.entities.TeamMember.filter({ email: user.email });
      const ownerIds = [...new Set(memberships.map((m) => m.created_by_id).filter(Boolean))];
      if (!ownerIds.length) return Response.json({ owners: [] });
      const users = await base44.asServiceRole.entities.User.list("-created_date", 500);
      const owners = users
        .filter((u) => ownerIds.includes(u.id))
        .map((u) => ({ owner_id: u.id, owner_name: u.full_name || u.email }));
      return Response.json({ owners });
    }

    if (action === 'get') {
      if (!owner_id) return Response.json({ error: 'Missing owner_id' }, { status: 400 });

      // Only teammates the owner actually invited may see the tracker
      const memberships = await base44.asServiceRole.entities.TeamMember.filter({
        email: user.email,
        created_by_id: owner_id,
      });
      if (!memberships.length) {
        return Response.json({ error: 'You have not been invited to this tracker' }, { status: 403 });
      }

      const [songs, projects] = await Promise.all([
        base44.asServiceRole.entities.PipelineSong.filter({ created_by_id: owner_id }, "sort_order", 500),
        base44.asServiceRole.entities.ReleaseProject.filter({ created_by_id: owner_id }, "-created_date", 100),
      ]);

      // Sign the owner's mix files so the teammate can listen (1-hour links)
      const withAudio = songs.filter((s) => s.audio_file_uri);
      const signed = await Promise.allSettled(
        withAudio.map((s) =>
          base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
            file_uri: s.audio_file_uri,
            expires_in: 3600,
          })
        )
      );
      const audioUrlById = new Map();
      withAudio.forEach((s, i) => {
        if (signed[i].status === 'fulfilled' && signed[i].value?.signed_url) {
          audioUrlById.set(s.id, signed[i].value.signed_url);
        }
      });

      const cleanSongs = songs.map((s) => {
        const out = {
          id: s.id,
          song_name: s.song_name,
          project_id: s.project_id || null,
          notes: s.notes || "",
          release_date: s.release_date || "",
          audio_version_label: s.audio_version_label || "",
          audio_url: audioUrlById.get(s.id) || null,
        };
        SONG_FIELDS.forEach((f) => { out[f] = !!s[f]; });
        return out;
      });

      return Response.json({
        songs: cleanSongs,
        projects: projects.map((p) => ({ id: p.id, name: p.name, project_type: p.project_type })),
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}