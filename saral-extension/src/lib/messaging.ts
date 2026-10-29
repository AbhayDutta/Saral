import { AppError } from './errors';
import type { ErrorCode } from './errors';
import type { FieldStatus, Schema } from './schema/types';

export type ExtensionResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: ErrorCode };

export type PanelRequest =
  | { type: 'SCAN_PAGE' }
  | { type: 'TRANSCRIBE'; audioBase64: string; mimeType: string; language?: string }
  | { type: 'EXTRACT'; schema: Schema; transcript: string }
  | { type: 'TRANSLATE'; schema: Schema }
  | { type: 'FILL'; schema: Schema; values: Record<string, string> }
  | {
      type: 'HIGHLIGHT';
      schema: Schema;
      values: Record<string, string>;
      statuses: Record<string, FieldStatus>;
    }
  | { type: 'CLEAR_HIGHLIGHTS' };

export type ContentRequest =
  | { type: 'SCAN' }
  | { type: 'FILL'; schema: Schema; values: Record<string, string> }
  | {
      type: 'HIGHLIGHT';
      schema: Schema;
      values: Record<string, string>;
      statuses: Record<string, FieldStatus>;
    }
  | { type: 'CLEAR_HIGHLIGHTS' };

export async function requestBackground<T>(request: PanelRequest): Promise<T> {
  let response: ExtensionResponse<T> | undefined;

  try {
    response = (await browser.runtime.sendMessage(request)) as ExtensionResponse<T> | undefined;
  } catch {
    throw new AppError('not-ready', 'Saral is not ready yet. Try again in a moment.');
  }

  if (!response) throw new AppError('unknown', 'No response from the background worker');
  if (!response.ok) throw new AppError(response.code ?? 'api', response.error);
  return response.data;
}

export async function requestTab<T>(tabId: number, request: ContentRequest): Promise<T> {
  let response: ExtensionResponse<T> | undefined;

  try {
    response = (await browser.tabs.sendMessage(tabId, request)) as
      | ExtensionResponse<T>
      | undefined;
  } catch {
    throw new AppError('no-content', "Saral can't read this page. Reload it and try again.");
  }

  if (!response) throw new AppError('no-content', 'No response from the page');
  if (!response.ok) throw new AppError('no-content', response.error);
  return response.data;
}
