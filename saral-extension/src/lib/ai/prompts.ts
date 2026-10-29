import type { Language } from '../i18n';
import type { Schema } from '../schema/types';

export const EXTRACTION_SYSTEM = `You are Saral, a careful form-filling assistant for people in India.
You receive a form schema, the target form language, and a transcript of what the person said.
The person may speak in Hindi, English, or a mix of both (Hinglish).
Return ONLY a JSON object with this shape:
{"values":{"<field id>":"<value>"},"confidence":{"<field id>":0.0}}
Rules:
- Use only field ids that appear in the schema.
- Never invent data. Leave fields out when the person did not mention them.
- Target form language handling:
  * If TARGET LANGUAGE is English (for an English webpage):
    All extracted values MUST be in English using Latin script (A-Z).
    If the person spoke names, addresses, or text in Hindi or Hinglish, transliterate them into standard English spelling (e.g. "राहुल शर्मा" -> "Rahul Sharma", "दिल्ली" -> "Delhi").
    For select/radio fields, pick the exact matching option value from the schema.
  * If TARGET LANGUAGE is Hindi (for a Hindi webpage):
    Extracted values should be in Hindi (Devanagari script) appropriate for Hindi forms (e.g. "राहुल शर्मा", "दिल्ली").
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

  return `TARGET FORM LANGUAGE: ${targetLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}

FORM SCHEMA:
${JSON.stringify({ title: schema.title, targetLanguage, fields }, null, 2)}

TRANSCRIPT OF WHAT THE USER SAID:
${transcript}

Remember: Fill values in ${targetLanguage === 'hi' ? 'Hindi (Devanagari script)' : 'English (Latin script)'} to match the form language.
Return the JSON object now.`;
}

export const TRANSLATION_SYSTEM = `You explain and translate web forms for people in India with limited digital literacy.
Keep names, numbers, and official abbreviations unchanged.
Return ONLY JSON with this shape:
{"title":"<Hindi title>","purpose":"<one simple Hindi sentence about what this form is for>","fields":[{"id":"<field id>","label":"<Hindi label>","hint":"<Hindi hint>","options":[{"value":"<original option value>","label":"<Hindi option label>"}]}]}
Rules:
- Use very simple, everyday Hindi.
- The purpose must be one short sentence, not a list.
- Keep every option value exactly as given; only translate the option label.
- Do not include markdown fences or commentary.`;

export function translationPrompt(schema: Schema): string {
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

Translate and explain this form:
${JSON.stringify(fields, null, 2)}

Return the JSON object now.`;
}
