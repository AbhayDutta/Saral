import type { Language, StringKey } from './i18n';
import { t } from './i18n';

export type ErrorCode =
  | 'missing-key'
  | 'network'
  | 'api'
  | 'parse'
  | 'no-tab'
  | 'no-content'
  | 'not-ready'
  | 'unknown';

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

const ERROR_KEYS: Record<ErrorCode, StringKey> = {
  'missing-key': 'errorMissingKey',
  network: 'errorNetwork',
  api: 'errorApi',
  parse: 'errorParse',
  'no-tab': 'errorNoTab',
  'no-content': 'errorNoContent',
  'not-ready': 'errorNotReady',
  unknown: 'errorUnknown',
};

export function toUserMessage(error: unknown, language: Language = 'en'): string {
  if (error instanceof AppError) {
    if (error.code === 'api' && error.message) {
      return error.message;
    }
    return t(ERROR_KEYS[error.code], language);
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return t('errorUnknown', language);
}
