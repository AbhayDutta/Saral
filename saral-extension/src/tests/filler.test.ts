import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fillValues } from '../entrypoints/content/filler';
import { scanDocument } from '../entrypoints/content/scanner';

const simpleForm = readFileSync(
  join(process.cwd(), 'src/tests/fixtures/simple-form.html'),
  'utf8',
);

describe('fillValues', () => {
  it('fills fields with native events and never submits the form', () => {
    document.body.innerHTML = simpleForm;

    const form = document.querySelector('form');
    expect(form).not.toBeNull();

    let submitted = false;
    form?.addEventListener('submit', (event) => {
      submitted = true;
      event.preventDefault();
    });

    const schema = scanDocument(document);
    const filled = fillValues(
      schema,
      {
        fullName: 'Asha Rao',
        email: 'asha@example.com',
        phone: '9876543210',
      },
      document,
    );

    expect(filled).toEqual(expect.arrayContaining(['fullName', 'email', 'phone']));
    expect((document.querySelector('#fullName') as HTMLInputElement).value).toBe('Asha Rao');
    expect((document.querySelector('#email') as HTMLInputElement).value).toBe(
      'asha@example.com',
    );
    expect(submitted).toBe(false);
  });
});
