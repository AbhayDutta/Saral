import type { FieldStatus, Schema } from '../../lib/schema/types';

export type HighlightKind = 'filled' | 'flagged';

const HIGHLIGHT_ATTR = 'data-saral-highlight';
const OUTLINE_ATTR = 'data-saral-outline';

export function highlightElement(element: HTMLElement, kind: HighlightKind): void {
  if (!element.hasAttribute(HIGHLIGHT_ATTR)) {
    element.setAttribute(OUTLINE_ATTR, element.style.outline);
  }

  element.style.outline = kind === 'filled' ? '2px solid #16a34a' : '2px solid #d97706';
  element.style.outlineOffset = '2px';
  element.setAttribute(HIGHLIGHT_ATTR, kind);
}

export function clearHighlights(doc: Document = document): void {
  doc.querySelectorAll<HTMLElement>(`[${HIGHLIGHT_ATTR}]`).forEach((element) => {
    element.style.outline = element.getAttribute(OUTLINE_ATTR) ?? '';
    element.style.outlineOffset = '';
    element.removeAttribute(HIGHLIGHT_ATTR);
    element.removeAttribute(OUTLINE_ATTR);
  });
}

export function highlightFields(
  schema: Schema,
  values: Record<string, string>,
  statuses: Record<string, FieldStatus>,
  doc: Document = document,
): void {
  clearHighlights(doc);

  for (const field of schema.fields) {
    const status = statuses[field.id];
    if (!status || status === 'empty' || status === 'skipped') continue;
    if (!values[field.id]) continue;

    const element = findElement(doc, field.selector);
    if (!element) continue;

    highlightElement(
      element,
      status === 'invalid' || status === 'needs-review' ? 'flagged' : 'filled',
    );
  }
}

function findElement(doc: Document, selector: string): HTMLElement | null {
  try {
    return doc.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
}
