import { describe, expect, it } from 'vitest';
import { isPermissionError } from '../lib/audio';

describe('isPermissionError', () => {
  it('detects DOMException NotAllowedError', () => {
    const error = new DOMException('Permission dismissed', 'NotAllowedError');
    expect(isPermissionError(error)).toBe(true);
  });

  it('detects DOMException PermissionDeniedError', () => {
    const error = new DOMException('Permission denied', 'PermissionDeniedError');
    expect(isPermissionError(error)).toBe(true);
  });

  it('detects standard Error with permission in message', () => {
    const error = new Error('Microphone permission denied by user');
    expect(isPermissionError(error)).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    const error = new Error('Network error');
    expect(isPermissionError(error)).toBe(false);
  });
});
