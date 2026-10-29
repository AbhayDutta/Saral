import { describe, expect, it, vi, beforeEach } from 'vitest';
import { transcribe } from '../lib/ai/sarvam';
import * as storage from '../lib/storage';

describe('Sarvam AI STT (Saaras)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws missing-key error when Sarvam API key is not configured', async () => {
    vi.spyOn(storage, 'getSettings').mockResolvedValue({
      sarvamApiKey: '',
      openrouterApiKey: 'test-key',
      defaultLanguage: 'auto',
      transcriptionModel: 'saaras:v4',
      extractionModel: 'google/gemini-2.5-flash',
      fallbackModel: 'meta-llama/llama-3.3-70b-instruct',
    });

    const dummyBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await expect(transcribe(dummyBlob)).rejects.toMatchObject({
      code: 'missing-key',
    });
  });

  it('sends request with api-subscription-key and returns transcript', async () => {
    vi.spyOn(storage, 'getSettings').mockResolvedValue({
      sarvamApiKey: 'test-sarvam-key',
      openrouterApiKey: 'test-key',
      defaultLanguage: 'auto',
      transcriptionModel: 'saaras:v4',
      extractionModel: 'google/gemini-2.5-flash',
      fallbackModel: 'meta-llama/llama-3.3-70b-instruct',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ transcript: 'नमस्ते दुनिया' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const dummyBlob = new Blob(['audio data'], { type: 'audio/webm' });
    const result = await transcribe(dummyBlob, 'hi');

    expect(result).toBe('नमस्ते दुनिया');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.sarvam.ai/speech-to-text');
    expect(options.headers).toMatchObject({
      'api-subscription-key': 'test-sarvam-key',
    });
  });

  it('falls back to saaras:v4 when an invalid or legacy model is in settings', async () => {
    vi.spyOn(storage, 'getSettings').mockResolvedValue({
      sarvamApiKey: 'test-sarvam-key',
      openrouterApiKey: 'test-key',
      defaultLanguage: 'auto',
      transcriptionModel: 'whisper-large-v3-turbo',
      extractionModel: 'google/gemini-2.5-flash',
      fallbackModel: 'meta-llama/llama-3.3-70b-instruct',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ transcript: 'Hello world' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const dummyBlob = new Blob(['audio data'], { type: 'audio/webm;codecs=opus' });
    await transcribe(dummyBlob, 'en');

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = options.body as FormData;
    expect(body.get('model')).toBe('saaras:v4');
    expect(body.get('language_code')).toBe('en-IN');
  });

  it('surfaces the exact error response message when Sarvam returns an error', async () => {
    vi.spyOn(storage, 'getSettings').mockResolvedValue({
      sarvamApiKey: 'test-sarvam-key',
      openrouterApiKey: 'test-key',
      defaultLanguage: 'auto',
      transcriptionModel: 'saaras:v4',
      extractionModel: 'google/gemini-2.5-flash',
      fallbackModel: 'meta-llama/llama-3.3-70b-instruct',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid subscription key' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const dummyBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await expect(transcribe(dummyBlob, 'hi')).rejects.toThrowError(
      'Sarvam AI (401): Invalid subscription key',
    );
  });
});
