import { describe, expect, it } from 'vitest';
import type { Field } from '../lib/schema/types';
import {
  normalizeDate,
  normalizeEmail,
  normalizePhone,
  normalizeValue,
} from '../lib/schema/normalize';

function field(overrides: Partial<Field>): Field {
  return {
    id: 'value',
    name: 'value',
    label: 'Value',
    type: 'text',
    required: false,
    selector: '#value',
    ...overrides,
  };
}

describe('normalizePhone', () => {
  it('strips spaces and the country code', () => {
    expect(normalizePhone('+91 98765 43210')).toBe('9876543210');
  });

  it('drops a leading zero', () => {
    expect(normalizePhone('09876543210')).toBe('9876543210');
  });
});

describe('normalizeEmail', () => {
  it('turns spoken email into a normal address', () => {
    expect(normalizeEmail('asha dot rao at example dot com')).toBe('asha.rao@example.com');
  });
});

describe('normalizeDate', () => {
  it('converts day-first dates to ISO', () => {
    expect(normalizeDate('05/01/2026')).toBe('2026-01-05');
  });

  it('converts spoken dates to ISO', () => {
    expect(normalizeDate('5 January 2026')).toBe('2026-01-05');
  });

  it('keeps ISO dates unchanged', () => {
    expect(normalizeDate('2026-01-05')).toBe('2026-01-05');
  });
});

describe('normalizeValue', () => {
  it('maps an option label to its value', () => {
    const state = field({
      type: 'select',
      options: [
        { label: 'Delhi', value: 'DL' },
        { label: 'Maharashtra', value: 'MH' },
      ],
    });

    expect(normalizeValue(state, 'Delhi')).toBe('DL');
  });

  it('normalises a spoken checkbox answer', () => {
    expect(normalizeValue(field({ type: 'checkbox' }), 'haan')).toBe('true');
  });
});
