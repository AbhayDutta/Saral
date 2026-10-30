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

  // Map Language code → Sarvam BCP-47 code using the central lookup.
  // Lazy-import to keep the function self-contained when `language` is already
  // a BCP-47 string passed directly (edge case / tests).
  const { SARVAM_CODE_MAP } = await import('../i18n');
  const sarvamCode =
    SARVAM_CODE_MAP[language as keyof typeof SARVAM_CODE_MAP] ??
    (language && language !== 'auto' ? language : 'unknown');
  form.append('language_code', sarvamCode);

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
      const errJson = (await response.json()) as unknown;
      detail = extractErrorDetail(errJson);
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

export function extractErrorDetail(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return String(data);

  const obj = data as Record<string, unknown>;

  // 1. Check `detail` (FastAPI / Pydantic validation errors)
  if (typeof obj.detail === 'string') return obj.detail;
  if (Array.isArray(obj.detail)) {
    const messages = obj.detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const rec = item as Record<string, unknown>;
          return (rec.msg || rec.message || JSON.stringify(rec)) as string;
        }
        return String(item);
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join('; ');
  }
  if (obj.detail && typeof obj.detail === 'object') {
    const d = obj.detail as Record<string, unknown>;
    if (typeof d.message === 'string') return d.message;
    if (typeof d.msg === 'string') return d.msg;
  }

  // 2. Check `error` or `errors` (Sarvam / REST API envelopes)
  const err = obj.error ?? obj.errors;
  if (typeof err === 'string') return err;
  if (Array.isArray(err)) {
    const messages = err
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const rec = item as Record<string, unknown>;
          return (rec.message || rec.msg || rec.detail || JSON.stringify(rec)) as string;
        }
        return String(item);
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join('; ');
  }
  if (err && typeof err === 'object') {
    const errObj = err as Record<string, unknown>;
    if (typeof errObj.message === 'string') return errObj.message;
    if (typeof errObj.msg === 'string') return errObj.msg;
    if (typeof errObj.detail === 'string') return errObj.detail;
    return JSON.stringify(errObj);
  }

  // 3. Check `message`
  if (typeof obj.message === 'string') return obj.message;

  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}
