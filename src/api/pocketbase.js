import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

// Disable auto-cancellation so concurrent requests don't cancel each other
pb.autoCancellation(false);

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4'];
const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.aac', '.m4a'];

export const uploadAudioFile = async (file) => {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_AUDIO_TYPES.includes(file.type) && !ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    throw new Error('Unsupported file type. Please upload an MP3, WAV, or AAC file.');
  }

  const formData = new FormData();
  formData.append('audio', file);
  // audio_uploads collection must exist in PocketBase with a file field named "audio"
  const record = await pb.collection('audio_uploads').create(formData);
  const fileUrl = pb.files.getURL(record, record.audio);
  return { file_url: fileUrl, record_id: record.id };
};
