import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { scanDocument } from '../entrypoints/content/scanner';

const simpleForm = readFileSync(
  join(process.cwd(), 'src/tests/fixtures/simple-form.html'),
  'utf8',
);
const selectRadioForm = readFileSync(
  join(process.cwd(), 'src/tests/fixtures/select-radio-form.html'),
  'utf8',
);

describe('scanDocument', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('finds text fields, labels and required flags', () => {
    document.body.innerHTML = simpleForm;
    const schema = scanDocument(document);

    const name = schema.fields.find((field) => field.id === 'fullName');
    expect(name).toMatchObject({ label: 'Full name', type: 'text', required: true });
    expect(schema.fields.some((field) => field.id === 'email')).toBe(true);
  });

  it('skips password, OTP and card fields', () => {
    document.body.innerHTML = simpleForm;
    const schema = scanDocument(document);
    const ids = schema.fields.map((field) => field.id);

    expect(ids).not.toContain('password');
    expect(ids).not.toContain('otp');
    expect(ids).not.toContain('card');
  });

  it('groups radio options and reads select options', () => {
    document.body.innerHTML = selectRadioForm;
    const schema = scanDocument(document);

    const gender = schema.fields.find((field) => field.id === 'gender');
    expect(gender?.type).toBe('radio');
    expect(gender?.label).toBe('Gender');
    expect(gender?.options?.map((option) => option.value)).toEqual(['male', 'female']);

    const state = schema.fields.find((field) => field.id === 'state');
    expect(state?.type).toBe('select');
    expect(state?.options?.map((option) => option.value)).toEqual(['', 'DL', 'MH']);
  });

  it('detects page language as English for English form', () => {
    document.body.innerHTML = simpleForm;
    const schema = scanDocument(document);
    expect(schema.pageLanguage).toBe('en');
  });

  it('detects page language as Hindi when Devanagari text or lang="hi" is present', () => {
    document.documentElement.setAttribute('lang', 'hi');
    document.body.innerHTML = `
      <form>
        <label for="naam">पूरा नाम</label>
        <input id="naam" type="text" />
        <label for="pata">पता</label>
        <input id="pata" type="text" />
      </form>
    `;
    const schema = scanDocument(document);
    expect(schema.pageLanguage).toBe('hi');
    document.documentElement.removeAttribute('lang');
  });
});
