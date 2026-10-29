import type { Field, Schema } from '../../lib/schema/types';
import { highlightElement } from './highlight';

export function fillValues(
  schema: Schema,
  values: Record<string, string>,
  doc: Document = document,
): string[] {
  // Saral only fills fields. It never calls form.submit(), clicks a submit
  // button, or presses Enter; the person reviews and submits the page.
  const filled: string[] = [];

  for (const field of schema.fields) {
    const value = values[field.id];
    if (!value) continue;

    const element = findElement(doc, field.selector);
    if (!element) continue;

    const changed = applyValue(element, field, value);
    if (!changed) continue;

    filled.push(field.id);
    highlightElement(changed, 'filled');
  }

  return filled;
}

function findElement(doc: Document, selector: string): HTMLElement | null {
  try {
    return doc.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
}

function applyValue(element: HTMLElement, field: Field, value: string): HTMLElement | null {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox') {
      setChecked(element, /^(true|yes|1|on)$/i.test(value));
      return element;
    }

    if (element.type === 'radio') {
      const target =
        field.options?.find(
          (option) =>
            option.value === value || option.label.toLowerCase() === value.toLowerCase(),
        )?.value ?? value;

      const group = element.name
        ? Array.from(
            element.ownerDocument.querySelectorAll<HTMLInputElement>(
              `input[type="radio"][name="${escapeAttribute(element.name)}"]`,
            ),
          )
        : [element];

      const match = group.find((radio) => radio.value === target);
      if (!match) return null;

      setChecked(match, true);
      return match;
    }

    setNativeValue(element, value);
    return element;
  }

  if (element instanceof HTMLTextAreaElement) {
    setNativeValue(element, value);
    return element;
  }

  if (element instanceof HTMLSelectElement) {
    const match = Array.from(element.options).find(
      (option) =>
        option.value === value || option.text.trim().toLowerCase() === value.toLowerCase(),
    );
    if (!match) return null;

    element.value = match.value;
    dispatch(element);
    return element;
  }

  return null;
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(element, value);
  else element.value = value;

  dispatch(element);
}

function setChecked(element: HTMLInputElement, checked: boolean): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
  if (setter) setter.call(element, checked);
  else element.checked = checked;

  dispatch(element);
}

function dispatch(element: HTMLElement): void {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function escapeAttribute(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
