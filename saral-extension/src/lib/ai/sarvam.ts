import { AppError } from '../errors';
import { getSettings } from '../storage';

const ENDPOINT = 'https://api.sarvam.ai/speech-to-text';

export async function transcribe(audio: Blob, language = ''): Promise<string> {
  const settings = await getSettings();
  if (!settings.sarvamApiKey) {
    throw new AppError('missing-key', 'Add your Sarvam AI API key in Settings first.');
  }

  if (audio.size === 0) {
    throw new AppError('parse', 'No audio was captured. Please try recording again.');
  }

  const cleanType = audio.type.includes('mp4')
    ? 'audio/mp4'
    : audio.type.includes('wav')
      ? 'audio/wav'
      : 'audio/webm';

  const filename =
    cleanType === 'audio/mp4'
      ? 'recording.mp4'
      : cleanType === 'audio/wav'
        ? 'recording.wav'
        : 'recording.webm';

  const cleanBlob = audio.type === cleanType ? audio : new Blob([audio], { type: cleanType });

  const form = new FormData();
  form.append('file', cleanBlob, filename);

  const model =
    settings.transcriptionModel && settings.transcriptionModel.startsWith('saaras')
      ? settings.transcriptionModel
      : 'saaras:v4';
  form.append('model', model);

  if (language === 'hi') {
    form.append('language_code', 'hi-IN');
  } else if (language === 'en') {
    form.append('language_code', 'en-IN');
  } else if (language && language !== 'auto') {
    form.append('language_code', language);
  } else {
    form.append('language_code', 'unknown');
  }

  form.append('mode', 'transcribe');

  let response: Response;

  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'api-subscription-key': settings.sarvamApiKey.trim(),
      },
      body: form,
    });
  } catch (err) {
    console.error('Sarvam AI network error:', err);
    throw new AppError('network', "Couldn't reach Sarvam AI. Check your connection.");
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errJson = (await response.json()) as {
        detail?: string | { msg?: string }[] | Record<string, unknown>;
        message?: string;
        error?: string;
      };
      if (typeof errJson.detail === 'string') {
        detail = errJson.detail;
      } else if (Array.isArray(errJson.detail)) {
        detail = errJson.detail
          .map((item) => (typeof item === 'object' && item?.msg ? item.msg : JSON.stringify(item)))
          .join('; ');
      } else if (errJson.message) {
        detail = errJson.message;
      } else if (errJson.error) {
        detail = errJson.error;
      } else {
        detail = JSON.stringify(errJson);
      }
    } catch {
      detail = (await response.text()).slice(0, 300);
    }
    console.error(`Sarvam AI API error (${response.status}):`, detail);
    throw new AppError('api', `Sarvam AI (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as { transcript?: string; text?: string };
  const text = (data.transcript ?? data.text ?? '').trim();
  if (!text) throw new AppError('parse', 'Sarvam AI returned an empty transcript.');

  return text;
}
