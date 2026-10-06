import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// The workspace-registered TikTok connector (APP_USER mode — each artist connects their own account)
const TIKTOK_CONNECTOR_ID = "6ac576aac6c81b30e8f0a86d";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "sync";

    // Mark the stored record disconnected — the OAuth grant itself is revoked client-side
    if (action === "disconnect") {
      const existing = await base44.entities.PlatformConnection.filter({ platform: "tiktok" });
      if (existing.length > 0) {
        await base44.entities.PlatformConnection.update(existing[0].id, { status: "disconnected" });
      }
      return Response.json({ success: true });
    }

    // The current app user's own TikTok connection
    let connection;
    try {
      connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection(TIKTOK_CONNECTOR_ID);
    } catch {
      return Response.json({ error: "TikTok is not connected yet", needs_connect: true }, { status: 400 });
    }

    const res = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,following_count,likes_count,video_count",
      {
        headers: { Authorization: `Bearer ${connection.accessToken}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.data?.user) {
      const msg = data?.error?.message || `TikTok API error (${res.status})`;
      return Response.json({ error: msg, needs_reconnect: res.status === 401 }, { status: 502 });
    }

    const u = data.data.user;
    const fields = {
      platform: "tiktok",
      connection_type: "oauth",
      status: "connected",
      last_synced: new Date().toISOString(),
      display_name: u.display_name || "",
      profile_image_url: u.avatar_url || "",
      stats: {
        tiktok_handle: "",
        followers: u.follower_count ?? 0,
        following: u.following_count ?? 0,
        total_likes: u.likes_count ?? 0,
        video_count: u.video_count ?? 0,
      },
    };

    const existing = await base44.entities.PlatformConnection.filter({ platform: "tiktok" });
    const record = existing.length > 0
      ? await base44.entities.PlatformConnection.update(existing[0].id, fields)
      : await base44.entities.PlatformConnection.create(fields);

    return Response.json({ data: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}