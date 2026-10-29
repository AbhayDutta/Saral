import { AppError } from '../errors';
import type { Schema } from '../schema/types';
import { getCache, setCache } from '../storage';
import { chat } from './openrouter';
import { TRANSLATION_SYSTEM, translationPrompt } from './prompts';

interface TranslatedOption {
  value?: string;
  label?: string;
}

interface TranslatedField {
  id?: string;
  label?: string;
  hint?: string;
  options?: TranslatedOption[];
}

interface TranslationResult {
  title?: string;
  purpose?: string;
  fields?: TranslatedField[];
}

export async function translateSchema(
  schema: Schema,
  target: 'hi' | 'en' = 'hi',
): Promise<Schema> {
  if (target === 'en') return schema;

  const cacheKey = `translation.${target}.${hash(
    JSON.stringify({
      title: schema.title,
      fields: schema.fields.map((field) => ({
        id: field.id,
        label: field.label,
        hint: field.hint,
        type: field.type,
        options: field.options,
      })),
    }),
  )}`;

  const cached = await getCache<Schema>(cacheKey);
  if (cached) return cached;

  const content = await chat(
    [
      { role: 'system', content: TRANSLATION_SYSTEM },
      { role: 'user', content: translationPrompt(schema) },
    ],
    { json: true },
  );

  const parsed = parseJson(content);
  const translations = new Map<string, TranslatedField>();
  for (const field of parsed.fields ?? []) {
    if (field.id) translations.set(field.id, field);
  }

  const translated: Schema = {
    ...schema,
    title: parsed.title?.trim() || schema.title,
    purpose: parsed.purpose?.trim() || schema.purpose,
    fields: schema.fields.map((field) => {
      const match = translations.get(field.id);
      if (!match) return field;

      const options = field.options?.map((option) => {
        const translatedOption = match.options?.find(
          (candidate) => candidate.value === option.value,
        );
        return translatedOption?.label?.trim()
          ? { ...option, label: translatedOption.label.trim() }
          : option;
      });

      return {
        ...field,
        label: match.label?.trim() || field.label,
        hint: match.hint?.trim() || field.hint,
        options,
      };
    }),
  };

  await setCache(cacheKey, translated);
  return translated;
}

function parseJson(content: string): TranslationResult {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(cleaned) as TranslationResult;
  } catch {
    throw new AppError('parse', "Saral couldn't read the translated labels.");
  }
}

function hash(value: string): string {
  let result = 5381;
  for (let index = 0; index < value.length; index += 1) {
    result = ((result << 5) + result + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result).toString(36);
}
