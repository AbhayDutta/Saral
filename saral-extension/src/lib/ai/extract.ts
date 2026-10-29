import { AppError } from '../errors';
import type { Language } from '../i18n';
import type { Schema } from '../schema/types';
import { chat } from './openrouter';
import { EXTRACTION_SYSTEM, extractionPrompt } from './prompts';

export interface ExtractedValues {
  values: Record<string, string>;
  confidence: Record<string, number>;
}

export async function extract(
  schema: Schema,
  transcript: string,
  targetLanguage: Language = schema.pageLanguage ?? 'en',
): Promise<ExtractedValues> {
  const content = await chat(
    [
      { role: 'system', content: EXTRACTION_SYSTEM },
      { role: 'user', content: extractionPrompt(schema, transcript, targetLanguage) },
    ],
    { json: true },
  );

  const parsed = parseJson(content);
  const rawValues =
    parsed.values && typeof parsed.values === 'object' && !Array.isArray(parsed.values)
      ? (parsed.values as Record<string, unknown>)
      : parsed;

  const rawConfidence =
    parsed.confidence && typeof parsed.confidence === 'object' && !Array.isArray(parsed.confidence)
      ? (parsed.confidence as Record<string, unknown>)
      : {};

  const values: Record<string, string> = {};
  const confidence: Record<string, number> = {};

  for (const field of schema.fields) {
    const raw = rawValues[field.id];
    if (raw === undefined || raw === null) continue;

    const value = typeof raw === 'string' ? raw.trim() : String(raw).trim();
    if (!value) continue;

    values[field.id] = value;
    const score = Number(rawConfidence[field.id]);
    confidence[field.id] = Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : 0.5;
  }

  return { values, confidence };
}

function parseJson(content: string): Record<string, unknown> {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new AppError('parse', "Saral couldn't read the AI response. Try speaking again.");
  }
}
