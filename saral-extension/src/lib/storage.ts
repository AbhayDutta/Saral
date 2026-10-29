import type { Language } from './i18n';

export type SettingLanguage = 'auto' | Language;

export interface Settings {
  sarvamApiKey: string;
  openrouterApiKey: string;
  defaultLanguage: SettingLanguage;
  transcriptionModel: string;
  extractionModel: string;
  fallbackModel: string;
}

export const DEFAULT_SETTINGS: Settings = {
  sarvamApiKey: '',
  openrouterApiKey: '',
  defaultLanguage: 'auto',
  transcriptionModel: 'saaras:v4',
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
  const saved = stored[SETTINGS_KEY] as (Partial<Settings> & { groqApiKey?: string }) | undefined;
  const model =
    saved?.transcriptionModel && saved.transcriptionModel.startsWith('saaras')
      ? saved.transcriptionModel
      : DEFAULT_SETTINGS.transcriptionModel;

  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    sarvamApiKey: saved?.sarvamApiKey ?? '',
    transcriptionModel: model,
  };
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
