import type { Field, FieldOption, FieldType, Schema } from '../../lib/schema/types';
import type { Language } from '../../lib/i18n';
import { isSensitiveField } from './sensitive';

const SKIP_INPUT_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

export function scanDocument(doc: Document = document): Schema {
  const fields: Field[] = [];
  const seenRadioGroups = new Set<string>();
  const seenIds = new Set<string>();

  const elements = Array.from(doc.querySelectorAll<HTMLElement>('input, select, textarea'));

  elements.forEach((element, index) => {
    if (!isCandidate(element) || isSensitiveField(element)) return;

    const type = getFieldType(element);
    if (!type) return;

    const name = element.getAttribute('name')?.trim() ?? '';

    if (type === 'radio') {
      const groupKey = name || element.id;
      if (!groupKey || seenRadioGroups.has(groupKey)) return;
      seenRadioGroups.add(groupKey);
    }

    const baseId = element.id || name || `field-${index}`;
    const section = getSection(element);
    const label =
      type === 'radio' ? section || getLabel(element) : getLabel(element);

    fields.push({
      id: uniqueId(baseId, seenIds),
      name,
      label: label || name || `Field ${index + 1}`,
      hint: getHint(element),
      type,
      required: isRequired(element),
      options: getOptions(element, type),
      section,
      selector: getSelector(element),
    });
  });

  const pageLanguage = detectPageLanguage(doc, fields);

  return {
    url: doc.location?.href ?? '',
    title: doc.title,
    fields,
    scannedAt: Date.now(),
    pageLanguage,
  };
}

/** Map HTML lang attribute prefixes to our Language codes. */
const LANG_PREFIX_MAP: [string, Language][] = [
  ['hi', 'hi'],
  ['as', 'as'],
  ['bn', 'bn'],
  ['gu', 'gu'],
  ['kn', 'kn'],
  ['kok', 'kok'],
  ['ml', 'ml'],
  ['mr', 'mr'],
  ['ne', 'ne'],
  ['or', 'od'],   // ISO 639-1 for Odia is 'or'
  ['od', 'od'],
  ['pa', 'pa'],
  ['ta', 'ta'],
  ['te', 'te'],
  ['ur', 'ur'],
];

function matchLangPrefix(tag: string): Language | null {
  const lower = tag.toLowerCase().trim();
  for (const [prefix, lang] of LANG_PREFIX_MAP) {
    if (lower === prefix || lower.startsWith(`${prefix}-`)) return lang;
  }
  return null;
}

export function detectPageLanguage(doc: Document = document, fields: Field[] = []): Language {
  // 1. Check <html lang="..."> and <body lang="...">
  const htmlLang = doc.documentElement?.getAttribute('lang') || doc.body?.getAttribute('lang') || '';

  // 2. Script-based detection on page content (overrides lang attr since many
  //    Indian-language pages use a default lang="en" template).
  const scriptLang = detectScriptLanguage(doc, fields);
  if (scriptLang) return scriptLang;

  // 3. Match html lang attribute
  const fromAttr = matchLangPrefix(htmlLang);
  if (fromAttr) return fromAttr;

  // 4. Check meta tags
  const metaLang = doc
    .querySelector('meta[http-equiv="content-language"], meta[name="language"]')
    ?.getAttribute('content') ?? '';
  const fromMeta = matchLangPrefix(metaLang);
  if (fromMeta) return fromMeta;

  return 'en';
}

/**
 * Detect language from the Unicode script blocks used in the page text.
 * Returns the first language whose script is significantly represented,
 * or null if no Indian script dominates.
 *
 * Unicode ranges:
 *  - Devanagari U+0900–U+097F (Hindi, Marathi, Nepali, Konkani, Sanskrit)
 *  - Bengali/Assamese U+0980–U+09FF
 *  - Gurmukhi (Punjabi) U+0A00–U+0A7F
 *  - Gujarati U+0A80–U+0AFF
 *  - Odia U+0B00–U+0B7F
 *  - Tamil U+0B80–U+0BFF
 *  - Telugu U+0C00–U+0C7F
 *  - Kannada U+0C80–U+0CFF
 *  - Malayalam U+0D00–U+0D7F
 *  - Arabic (Urdu) U+0600–U+06FF
 */
function detectScriptLanguage(doc: Document, fields: Field[]): Language | null {
  let sample = doc.title || '';
  for (const field of fields) {
    sample += ` ${field.label} ${field.hint ?? ''} ${field.section ?? ''}`;
  }

  if (sample.trim().length < 40) {
    const textNodes = Array.from(doc.querySelectorAll('h1, h2, h3, p, label, button, a')).slice(0, 15);
    sample += ' ' + textNodes.map((n) => n.textContent || '').join(' ');
  }

  const latinCount = (sample.match(/[a-zA-Z]/g) || []).length;

  // Each entry: [regex, minimum char count, Language].
  // Devanagari is checked but needs extra disambiguation (Hindi vs Marathi etc.).
  const scripts: [RegExp, Language][] = [
    [/[\u0980-\u09FF]/g, 'bn'],    // Bengali / Assamese (shared script)
    [/[\u0A00-\u0A7F]/g, 'pa'],    // Gurmukhi → Punjabi
    [/[\u0A80-\u0AFF]/g, 'gu'],    // Gujarati
    [/[\u0B00-\u0B7F]/g, 'od'],    // Odia
    [/[\u0B80-\u0BFF]/g, 'ta'],    // Tamil
    [/[\u0C00-\u0C7F]/g, 'te'],    // Telugu
    [/[\u0C80-\u0CFF]/g, 'kn'],    // Kannada
    [/[\u0D00-\u0D7F]/g, 'ml'],    // Malayalam
    [/[\u0600-\u06FF]/g, 'ur'],    // Arabic script → Urdu
  ];

  for (const [regex, lang] of scripts) {
    const count = (sample.match(regex) || []).length;
    if (count > 8 && count > latinCount * 0.25) return lang;
    if (count > 0 && latinCount === 0) return lang;
  }

  // Devanagari — could be Hindi, Marathi, Nepali, or Konkani.
  // Default to Hindi since it is by far the most common.
  const devanagariCount = (sample.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount > 8 && devanagariCount > latinCount * 0.25) return 'hi';
  if (devanagariCount > 0 && latinCount === 0) return 'hi';

  return null;
}


function isCandidate(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  if (element.closest('[hidden]')) return false;

  if (element instanceof HTMLInputElement) {
    if (SKIP_INPUT_TYPES.has(element.type)) return false;
    if (element.readOnly && element.type !== 'checkbox' && element.type !== 'radio') return false;
  }

  if (element instanceof HTMLTextAreaElement && element.readOnly) return false;

  return true;
}

function getFieldType(element: HTMLElement): FieldType | null {
  if (element instanceof HTMLSelectElement) return 'select';
  if (element instanceof HTMLTextAreaElement) return 'textarea';
  if (!(element instanceof HTMLInputElement)) return null;

  switch (element.type) {
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'number':
    case 'range':
      return 'number';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'checkbox':
      return 'checkbox';
    case 'radio':
      return 'radio';
    case 'password':
      return 'password';
    case 'file':
      return 'file';
    default:
      return 'text';
  }
}

function isRequired(element: HTMLElement): boolean {
  return element.hasAttribute('required') || element.getAttribute('aria-required') === 'true';
}

function getLabel(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return cleanLabel(ariaLabel);

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ');
    const cleaned = cleanLabel(text);
    if (cleaned) return cleaned;
  }

  if (element.id) {
    const explicit = element.ownerDocument.querySelector<HTMLLabelElement>(
      `label[for="${escapeAttribute(element.id)}"]`,
    );
    if (explicit) {
      const cleaned = cleanLabel(explicit.textContent);
      if (cleaned) return cleaned;
    }
  }

  const wrapping = element.closest('label');
  if (wrapping) {
    const clone = wrapping.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, select, textarea, button').forEach((node) => node.remove());
    const cleaned = cleanLabel(clone.textContent);
    if (cleaned) return cleaned;
  }

  return cleanLabel(element.getAttribute('placeholder') ?? '');
}

function getHint(element: HTMLElement): string | undefined {
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const text = describedBy
      .split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ');
    const cleaned = cleanLabel(text);
    if (cleaned) return cleaned;
  }

  const placeholder = cleanLabel(element.getAttribute('placeholder') ?? '');
  if (placeholder && placeholder !== getLabel(element)) return placeholder;

  const title = cleanLabel(element.getAttribute('title') ?? '');
  return title || undefined;
}

function getOptions(element: HTMLElement, type: FieldType): FieldOption[] | undefined {
  if (element instanceof HTMLSelectElement) {
    return Array.from(element.options).map((option) => ({
      label: option.text.trim(),
      value: option.value,
    }));
  }

  if (type === 'radio' && element instanceof HTMLInputElement) {
    const group = element.name
      ? Array.from(
          element.ownerDocument.querySelectorAll<HTMLInputElement>(
            `input[type="radio"][name="${escapeAttribute(element.name)}"]`,
          ),
        )
      : [element];

    return group.map((radio) => ({
      label: getLabel(radio) || radio.value,
      value: radio.value,
    }));
  }

  return undefined;
}

function getSection(element: HTMLElement): string | undefined {
  const legend = element.closest('fieldset')?.querySelector('legend');
  if (legend) {
    const cleaned = cleanLabel(legend.textContent);
    if (cleaned) return cleaned;
  }

  const heading = element.closest('section')?.querySelector('h1, h2, h3, h4');
  if (heading) {
    const cleaned = cleanLabel(heading.textContent);
    if (cleaned) return cleaned;
  }

  return undefined;
}

function getSelector(element: HTMLElement): string {
  if (element.id) return `#${escapeCss(element.id)}`;

  if (element instanceof HTMLInputElement && element.type === 'radio' && element.name) {
    return `input[type="radio"][name="${escapeAttribute(element.name)}"]`;
  }

  const name = element.getAttribute('name');
  if (name) {
    const tag = element.tagName.toLowerCase();
    const selector = `${tag}[name="${escapeAttribute(name)}"]`;
    if (element.ownerDocument.querySelectorAll(selector).length === 1) return selector;
  }

  return buildPath(element);
}

function buildPath(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== current.ownerDocument.body) {
    const node: HTMLElement = current;
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;

    const siblings = Array.from(parent.children).filter(
      (child: Element) => child.tagName === node.tagName,
    );
    const index = siblings.indexOf(node) + 1;
    parts.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${index})`);
    current = parent;
  }

  return parts.join(' > ');
}

function uniqueId(base: string, seen: Set<string>): string {
  let id = base;
  let suffix = 2;
  while (seen.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  seen.add(id);
  return id;
}

function cleanLabel(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/[:*]\s*$/, '').trim();
}

function escapeCss(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function escapeAttribute(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
