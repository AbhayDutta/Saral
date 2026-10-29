const SENSITIVE_AUTOCOMPLETE = [
  'current-password',
  'new-password',
  'one-time-code',
  'cc-number',
  'cc-csc',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'cc-name',
];

const SENSITIVE_PATTERNS = [
  /password/i,
  /passcode/i,
  /passwd/i,
  /otp/i,
  /one.?time.?code/i,
  /\bcvv\b/i,
  /\bcvc\b/i,
  /card.?number/i,
  /credit.?card/i,
  /debit.?card/i,
];

export function isSensitiveField(element: HTMLElement): boolean {
  if (element instanceof HTMLInputElement && element.type === 'password') return true;

  const autocomplete = element.getAttribute('autocomplete')?.toLowerCase() ?? '';
  if (
    autocomplete.startsWith('cc-') ||
    SENSITIVE_AUTOCOMPLETE.some(
      (value) => autocomplete === value || autocomplete.startsWith(`${value} `),
    )
  ) {
    return true;
  }

  const haystack = [
    element.getAttribute('name'),
    element.id,
    element.getAttribute('placeholder'),
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    labelText(element),
  ]
    .filter(Boolean)
    .join(' ');

  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(haystack));
}

function labelText(element: HTMLElement): string {
  const id = element.id;
  if (id) {
    const label = element.ownerDocument.querySelector(
      `label[for="${id.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`,
    );
    if (label?.textContent) return label.textContent;
  }
  return element.closest('label')?.textContent ?? '';
}
