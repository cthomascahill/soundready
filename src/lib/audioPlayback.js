// The file storage serves audio with a generic "application/octet-stream"
// content type, which browsers refuse to play in an <audio> element. This
// resolves any audio URL into a playable one: properly typed files stream
// straight through; generic ones are fetched once, re-typed from the file
// extension, and returned as a local object URL the browser can decode.

const MIME_BY_EXT = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
  webm: "audio/webm",
  flac: "audio/flac",
};

const cache = new Map();

export async function resolvePlayableAudioUrl(src) {
  if (!src) return src;
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (cache.has(src)) return cache.get(src);

  let playable = src;
  try {
    const res = await fetch(src);
    const type = res.headers.get("content-type") || "";
    if (res.ok && !type.startsWith("audio/") && !type.startsWith("video/")) {
      const buf = await res.arrayBuffer();
      const ext = /\.(\w{2,5})(?:\?|$)/.exec(src)?.[1]?.toLowerCase();
      playable = URL.createObjectURL(new Blob([buf], { type: MIME_BY_EXT[ext] || "audio/mpeg" }));
    }
  } catch {
    // Fetch blocked — fall back to the original URL; the browser may still play it.
  }
  cache.set(src, playable);
  return playable;
}