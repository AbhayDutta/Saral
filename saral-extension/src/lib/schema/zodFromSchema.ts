import { z } from 'zod';
import type { Language } from '../i18n';
import { t } from '../i18n';
import type { Field, Schema } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\d{10}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const NUMBER = /^-?\d+(\.\d+)?$/;
const TIME = /^\d{2}:\d{2}$/;

export function zodFromField(field: Field, language: Language = 'en'): z.ZodType<string> {
  let rule = z.string();

  if (field.required) rule = rule.min(1, t('requiredField', language));

  switch (field.type) {
    case 'email':
      rule = rule.refine(
        (value) => value === '' || EMAIL.test(value),
        t('invalidEmail', language),
      );
      break;
    case 'tel':
      rule = rule.refine(
        (value) => value === '' || PHONE.test(value),
        t('invalidPhone', language),
      );
      break;
    case 'number':
      rule = rule.refine(
        (value) => value === '' || NUMBER.test(value),
        t('invalidNumber', language),
      );
      break;
    case 'date':
      rule = rule.refine(
        (value) => value === '' || DATE.test(value),
        t('invalidDate', language),
      );
      break;
    case 'time':
      rule = rule.refine(
        (value) => value === '' || TIME.test(value),
        t('invalidTime', language),
      );
      break;
    case 'select':
    case 'radio': {
      const allowed = new Set((field.options ?? []).map((option) => option.value));
      if (allowed.size > 0) {
        rule = rule.refine(
          (value) => value === '' || allowed.has(value),
          t('invalidOption', language),
        );
      }
      break;
    }
    default:
      break;
  }

  return rule;
}

export function zodFromSchema(
  schema: Schema,
  language: Language = 'en',
): z.ZodObject<Record<string, z.ZodType<string>>> {
  const shape: Record<string, z.ZodType<string>> = {};
  for (const field of schema.fields) {
    shape[field.id] = zodFromField(field, language);
  }
  return z.object(shape);
}
