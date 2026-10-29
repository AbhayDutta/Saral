import type { Language } from '../i18n';
import { LANGUAGES } from '../i18n';
import type { Schema } from '../schema/types';

/** Map Language code to its English name for use in prompts. */
function languageEnglishName(code: Language): string {
  return LANGUAGES.find((l) => l.code === code)?.englishName ?? 'English';
}

/** Map Language code to its native name for use in prompts. */
function languageNativeName(code: Language): string {
  return LANGUAGES.find((l) => l.code === code)?.nativeName ?? 'English';
}

export const EXTRACTION_SYSTEM = `You are Saral, a careful form-filling assistant for people in India.
You receive a form schema, the target form language, and a transcript of what the person said.
The person may speak in any Indian language, English, or a mix.
Return ONLY a JSON object with this shape:
{"values":{"<field id>":"<value>"},"confidence":{"<field id>":0.0}}
Rules:
- Use only field ids that appear in the schema.
- Never invent data. Leave fields out when the person did not mention them.
- Target form language handling:
  * If TARGET LANGUAGE is English (for an English webpage):
    All extracted values MUST be in English using Latin script (A-Z).
    If the person spoke names, addresses, or text in any Indian language, transliterate them into standard English spelling (e.g. "राहुल शर्मा" -> "Rahul Sharma", "দিল্লি" -> "Delhi").
    For select/radio fields, pick the exact matching option value from the schema.
  * If TARGET LANGUAGE is any Indian language (Hindi, Bengali, Tamil, etc.):
    Extracted values should be in the appropriate script for that language.
    For select/radio fields, pick the matching option value from the schema.
- Numbers, phone numbers, and dates must use standard digits (0-9).
- Email addresses must always be in standard lowercase email format.
- confidence is a number from 0 to 1 for each value you return.
- Do not include markdown fences or commentary.`;

export function extractionPrompt(
  schema: Schema,
  transcript: string,
  targetLanguage: Language = 'en',
): string {
  const fields = schema.fields.map((field) => ({
    id: field.id,
    label: field.label,
    hint: field.hint,
    type: field.type,
    required: field.required,
    options: field.options?.map((option) => ({ label: option.label, value: option.value })),
  }));

  const langName = languageEnglishName(targetLanguage);
  const langNative = languageNativeName(targetLanguage);
  const scriptHint =
    targetLanguage === 'en'
      ? 'English (Latin script)'
      : `${langName} (${langNative} script)`;

  return `TARGET FORM LANGUAGE: ${langName} (${langNative})

FORM SCHEMA:
${JSON.stringify({ title: schema.title, targetLanguage, fields }, null, 2)}

TRANSCRIPT OF WHAT THE USER SAID:
${transcript}

Remember: Fill values in ${scriptHint} to match the form language.
Return the JSON object now.`;
}

export function translationSystem(targetLanguage: Language = 'hi'): string {
  const langName = languageEnglishName(targetLanguage);
  const langNative = languageNativeName(targetLanguage);
  return `You explain and translate web forms for people in India with limited digital literacy.
Translate the form labels, hint, and purpose into ${langName} (${langNative}).
Keep names, numbers, and official abbreviations unchanged.
Return ONLY JSON with this shape:
{"title":"<translated title>","purpose":"<one simple sentence in ${langName} about what this form is for>","fields":[{"id":"<field id>","label":"<translated label in ${langName}>","hint":"<translated hint in ${langName}>","options":[{"value":"<original option value>","label":"<translated option label in ${langName}>"}]}]}
Rules:
- Use very simple, everyday ${langName} in ${langNative} script.
- The purpose must be one short sentence, not a list.
- Keep every option value exactly as given; only translate the option label.
- Do not include markdown fences or commentary.`;
}

export function translationPrompt(schema: Schema, targetLanguage: Language = 'hi'): string {
  const langName = languageEnglishName(targetLanguage);
  const langNative = languageNativeName(targetLanguage);
  const fields = schema.fields.map((field) => ({
    id: field.id,
    label: field.label,
    hint: field.hint,
    type: field.type,
    options: field.options?.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  }));

  return `Form title: ${schema.title || '(untitled form)'}
TARGET LANGUAGE: ${langName} (${langNative})

Translate and explain this form into ${langName} (${langNative}):
${JSON.stringify(fields, null, 2)}

Return the JSON object now.`;
}
