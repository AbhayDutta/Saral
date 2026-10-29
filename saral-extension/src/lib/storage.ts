import type { Language } from './i18n';

export interface Settings {
  groqApiKey: string;
  openrouterApiKey: string;
  defaultLanguage: Language;
  transcriptionModel: string;
  extractionModel: string;
  fallbackModel: string;
}

export const DEFAULT_SETTINGS: Settings = {
  groqApiKey: '',
  openrouterApiKey: '',
  defaultLanguage: 'hi',
  transcriptionModel: 'whisper-large-v3-turbo',
  extractionModel: 'google/gemini-2.5-flash',
  fallbackModel: 'meta-llama/llama-3.3-70b-instruct',
};

const SETTINGS_KEY = 'saral.settings';
const DRAFT_KEY = 'saral.draft';
const CACHE_PREFIX = 'saral.cache.';

export interface Draft {
  schemaUrl: string;
  values: Record<string, string>;
  savedAt: number;
}

export async function getSettings(): Promise<Settings> {
  const stored = await browser.storage.local.get(SETTINGS_KEY);
  const saved = stored[SETTINGS_KEY] as Partial<Settings> | undefined;
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await browser.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

export async function getCache<T>(key: string): Promise<T | undefined> {
  const stored = await browser.storage.local.get(`${CACHE_PREFIX}${key}`);
  return stored[`${CACHE_PREFIX}${key}`] as T | undefined;
}

export async function setCache<T>(key: string, value: T): Promise<void> {
  await browser.storage.local.set({ [`${CACHE_PREFIX}${key}`]: value });
}

export async function saveDraft(draft: Draft): Promise<void> {
  await browser.storage.local.set({ [DRAFT_KEY]: draft });
}

export async function loadDraft(): Promise<Draft | undefined> {
  const stored = await browser.storage.local.get(DRAFT_KEY);
  return stored[DRAFT_KEY] as Draft | undefined;
}
