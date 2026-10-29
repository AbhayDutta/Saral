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

export function detectPageLanguage(doc: Document = document, fields: Field[] = []): Language {
  // 1. Check <html lang="..."> and <body lang="...">
  const htmlLang = (doc.documentElement?.getAttribute('lang') || doc.body?.getAttribute('lang') || '')
    .toLowerCase()
    .trim();

  // If text has significant Devanagari, it is Hindi regardless of default template lang="en"
  if (hasSignificantDevanagari(doc, fields)) {
    return 'hi';
  }

  if (htmlLang.startsWith('hi')) return 'hi';

  // 2. Check meta tags
  const metaLang = doc
    .querySelector('meta[http-equiv="content-language"], meta[name="language"]')
    ?.getAttribute('content')
    ?.toLowerCase()
    ?.trim();
  if (metaLang?.startsWith('hi')) return 'hi';

  return 'en';
}

function hasSignificantDevanagari(doc: Document, fields: Field[]): boolean {
  let sample = doc.title || '';
  for (const field of fields) {
    sample += ` ${field.label} ${field.hint ?? ''} ${field.section ?? ''}`;
  }

  if (sample.trim().length < 40) {
    const textNodes = Array.from(doc.querySelectorAll('h1, h2, h3, p, label, button, a')).slice(0, 15);
    sample += ' ' + textNodes.map((n) => n.textContent || '').join(' ');
  }

  const devanagariCount = (sample.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (sample.match(/[a-zA-Z]/g) || []).length;

  if (devanagariCount > 8 && devanagariCount > latinCount * 0.25) return true;
  if (devanagariCount > 0 && latinCount === 0) return true;
  return false;
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
