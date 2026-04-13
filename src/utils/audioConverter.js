/**
 * Converts an audio File (any format, including WAV) to audio/webm
 * using the Web Audio API + MediaRecorder. Works in modern browsers.
 */
export async function convertToUploadableAudio(file) {
  // If already a supported non-WAV format, return as-is
  const WAV_TYPES = ["audio/wav", "audio/x-wav", "audio/wave"];
  if (!WAV_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".wav")) {
    return file;
  }

  // Decode the audio
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // Re-render via OfflineAudioContext to get a clean buffer
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  const renderedBuffer = await offlineCtx.startRendering();

  // Stream through MediaRecorder to get a compressed blob
  const streamCtx = new AudioContext();
  const streamDest = streamCtx.createMediaStreamDestination();
  const playbackSource = streamCtx.createBufferSource();
  playbackSource.buffer = renderedBuffer;
  playbackSource.connect(streamDest);

  // Pick best supported MIME type
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
    ? "audio/webm"
    : "audio/ogg";

  return new Promise((resolve, reject) => {
    const chunks = [];
    const recorder = new MediaRecorder(streamDest.stream, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      streamCtx.close();
      const ext = mimeType.includes("ogg") ? "ogg" : "webm";
      const blob = new Blob(chunks, { type: mimeType });
      const converted = new File([blob], file.name.replace(/\.[^/.]+$/, `.${ext}`), { type: mimeType });
      resolve(converted);
    };
    recorder.onerror = reject;
    playbackSource.start(0);
    recorder.start();
    // Stop after the audio duration
    setTimeout(() => recorder.stop(), (renderedBuffer.duration * 1000) + 200);
  });
}