import { as } from './locales/as';
import { bn } from './locales/bn';
import { en } from './locales/en';
import { gu } from './locales/gu';
import { hi } from './locales/hi';
import { kn } from './locales/kn';
import { kok } from './locales/kok';
import { ml } from './locales/ml';
import { mr } from './locales/mr';
import { ne } from './locales/ne';
import { od } from './locales/od';
import { pa } from './locales/pa';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { ur } from './locales/ur';

export type { StringKey } from './locales/en';
import type { StringKey } from './locales/en';

export type Language =
  | 'en'
  | 'hi'
  | 'as'
  | 'bn'
  | 'gu'
  | 'kn'
  | 'kok'
  | 'ml'
  | 'mr'
  | 'ne'
  | 'od'
  | 'pa'
  | 'ta'
  | 'te'
  | 'ur';

/** Metadata for each supported language. */
export interface LanguageMeta {
  code: Language;
  /** Name in the language's own script. */
  nativeName: string;
  /** English name for accessibility / fallback. */
  englishName: string;
  /** BCP-47 code sent to Sarvam AI. */
  sarvamCode: string;
}

/** All languages supported by Saral, in display order. */
export const LANGUAGES: readonly LanguageMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', sarvamCode: 'en-IN' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', sarvamCode: 'hi-IN' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', sarvamCode: 'as-IN' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', sarvamCode: 'bn-IN' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', sarvamCode: 'gu-IN' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', sarvamCode: 'kn-IN' },
  { code: 'kok', nativeName: 'कोंकणी', englishName: 'Konkani', sarvamCode: 'kok-IN' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', sarvamCode: 'ml-IN' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', sarvamCode: 'mr-IN' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', sarvamCode: 'ne-IN' },
  { code: 'od', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', sarvamCode: 'od-IN' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', sarvamCode: 'pa-IN' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', sarvamCode: 'ta-IN' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', sarvamCode: 'te-IN' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', sarvamCode: 'ur-IN' },
] as const;

/** Quick lookup: language code → Sarvam BCP-47 code. */
export const SARVAM_CODE_MAP: Record<Language, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.sarvamCode]),
) as Record<Language, string>;

const TRANSLATIONS: Record<Language, Record<StringKey, string>> = {
  en,
  hi,
  as,
  bn,
  gu,
  kn,
  kok,
  ml,
  mr,
  ne,
  od,
  pa,
  ta,
  te,
  ur,
};

export function t(key: StringKey, language: Language): string {
  return TRANSLATIONS[language]?.[key] ?? en[key];
}
