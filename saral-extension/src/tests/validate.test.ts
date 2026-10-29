import { describe, expect, it } from 'vitest';
import type { Field } from '../lib/schema/types';
import { validateField } from '../lib/schema/validate';

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

describe('validateField', () => {
  it('flags an empty required field', () => {
    expect(validateField(field({ required: true }), '')).toMatchObject({
      status: 'invalid',
    });
  });

  it('leaves an empty optional field alone', () => {
    expect(validateField(field({}), '')).toMatchObject({ status: 'empty' });
  });

  it('rejects a malformed email', () => {
    expect(validateField(field({ type: 'email' }), 'not-an-email')).toMatchObject({
      status: 'invalid',
    });
  });

  it('accepts a spoken email after normalisation', () => {
    expect(validateField(field({ type: 'email' }), 'asha at example dot com')).toMatchObject({
      status: 'filled',
    });
  });

  it('accepts an Indian mobile number after normalisation', () => {
    expect(validateField(field({ type: 'tel' }), '+91 98765 43210')).toMatchObject({
      status: 'filled',
    });
  });

  it('rejects an option that is not in the list', () => {
    const state = field({
      type: 'select',
      options: [{ label: 'Delhi', value: 'DL' }],
    });

    expect(validateField(state, 'Mumbai')).toMatchObject({ status: 'invalid' });
  });

  it('marks file fields as skipped', () => {
    expect(validateField(field({ type: 'file' }), '')).toMatchObject({
      status: 'skipped',
    });
  });

  it('returns plain-language Hindi messages', () => {
    expect(validateField(field({ required: true }), '', 'hi')).toMatchObject({
      status: 'invalid',
      message: 'यह जानकारी ज़रूरी है।',
    });
  });

  it('requires a required checkbox to be ticked', () => {
    expect(validateField(field({ type: 'checkbox', required: true }), 'false')).toMatchObject({
      status: 'invalid',
    });
  });
});
