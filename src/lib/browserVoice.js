// Sam's default device voice, shared by the speech hook and the homepage
// video narration: Google US English when the browser has it, otherwise a
// natural female English voice, then the system default.
export function pickSamDeviceVoice(voices) {
  if (!voices || voices.length === 0) return null;
  return (
    voices.find((v) => v.name === "Google US English") ||
    voices.find((v) => /samantha|aria|jenny|zira|karen|serena|female/i.test(v.name)) ||
    voices.find((v) => v.default) ||
    voices[0]
  );
}