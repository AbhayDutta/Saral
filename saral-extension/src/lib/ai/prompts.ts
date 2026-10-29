import type { Schema } from '../schema/types';

export const EXTRACTION_SYSTEM = `You are Saral, a careful form-filling assistant for people in India.
You receive a form schema and a transcript of what the person said.
Return ONLY a JSON object with this shape:
{"values":{"<field id>":"<value>"},"confidence":{"<field id>":0.0}}
Rules:
- Use only field ids that appear in the schema.
- Never invent data. Leave fields out when the person did not mention them.
- Preserve the person's meaning. Do not translate names or addresses.
- confidence is a number from 0 to 1 for each value you return.
- Do not include markdown fences or commentary.`;

export function extractionPrompt(schema: Schema, transcript: string): string {
  const fields = schema.fields.map((field) => ({
    id: field.id,
    label: field.label,
    hint: field.hint,
    type: field.type,
    required: field.required,
    options: field.options?.map((option) => option.label),
  }));

  return `FORM SCHEMA:
${JSON.stringify({ title: schema.title, fields }, null, 2)}

TRANSCRIPT:
${transcript}

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
