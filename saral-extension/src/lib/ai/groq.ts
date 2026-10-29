import { AppError } from '../errors';
import { getSettings } from '../storage';

const ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions';

export async function transcribe(audio: Blob, language = ''): Promise<string> {
  const settings = await getSettings();
  if (!settings.groqApiKey) {
    throw new AppError('missing-key', 'Add your Groq API key in Settings first.');
  }

  const form = new FormData();
  const filename = audio.type.includes('mp4') ? 'recording.mp4' : 'recording.webm';
  form.append('file', audio, filename);
  form.append('model', settings.transcriptionModel);

  // Leave the language out by default so Whisper can handle Hindi, English,
  // and Hinglish in the same recording.
  if (language && language !== 'auto') form.append('language', language);

  let response: Response;

  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${settings.groqApiKey}` },
      body: form,
    });
  } catch {
    throw new AppError('network', "Couldn't reach Groq. Check your connection.");
  }

  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new AppError('api', `Groq ${response.status}: ${body}`);
  }

  const data = (await response.json()) as { text?: string };
  const text = data.text?.trim() ?? '';
  if (!text) throw new AppError('parse', 'Groq returned an empty transcript.');

  return text;
}
