import type { Language } from '../i18n';
import { t } from '../i18n';
import type { Field, FieldStatus, Schema } from './types';
import { normalizeValue } from './normalize';
import { zodFromField } from './zodFromSchema';

export interface FieldValidation {
  status: FieldStatus;
  message?: string;
}

export function validateField(
  field: Field,
  raw: string | undefined,
  language: Language = 'en',
): FieldValidation {
  if (field.type === 'file') {
    return { status: 'skipped', message: t('fileManual', language) };
  }

  if (field.type === 'checkbox') {
    const checked = normalizeValue(field, raw ?? '');
    if (checked === 'true') return { status: 'filled' };
    return field.required
      ? { status: 'invalid', message: t('requiredField', language) }
      : { status: 'empty' };
  }

  const value = normalizeValue(field, raw ?? '');

  if (!value) {
    return field.required
      ? { status: 'invalid', message: t('requiredField', language) }
      : { status: 'empty' };
  }

  const result = zodFromField(field, language).safeParse(value);
  if (!result.success) {
    return {
      status: 'invalid',
      message: result.error.issues[0]?.message ?? t('requiredField', language),
    };
  }

  return { status: 'filled' };
}

export function validateSchema(
  schema: Schema,
  values: Record<string, string>,
  language: Language = 'en',
): Record<string, FieldValidation> {
  const result: Record<string, FieldValidation> = {};
  for (const field of schema.fields) {
    result[field.id] = validateField(field, values[field.id], language);
  }
  return result;
}
