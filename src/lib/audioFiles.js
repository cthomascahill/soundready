// Helpers for the drag-and-drop song intake flow

const AUDIO_EXTENSIONS = /\.(mp3|wav|aac|flac|m4a|ogg|opus|aiff?|wma)$/i;

export function isAudioFile(file) {
  return !!file && (file.type?.startsWith("audio/") || AUDIO_EXTENSIONS.test(file.name || ""));
}

// Turns "midnight_city-final_mix 2.mp3" into a sensible starting title
export function cleanSongTitle(filename = "") {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}