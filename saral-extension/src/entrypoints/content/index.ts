import type { ContentRequest, ExtensionResponse } from '../../lib/messaging';
import { fillValues } from './filler';
import { clearHighlights, highlightFields } from './highlight';
import { scanDocument } from './scanner';

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true,
  runAt: 'document_idle',
  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      sendResponse(handleMessage(message as ContentRequest));
    });
  },
});

function handleMessage(request: ContentRequest): ExtensionResponse<unknown> {
  try {
    switch (request.type) {
      case 'SCAN':
        return { ok: true, data: scanDocument() };

      case 'FILL':
        return { ok: true, data: fillValues(request.schema, request.values) };

      case 'HIGHLIGHT':
        highlightFields(request.schema, request.values, request.statuses);
        return { ok: true, data: null };

      case 'CLEAR_HIGHLIGHTS':
        clearHighlights();
        return { ok: true, data: null };

      default:
        return { ok: false, error: 'Unknown content request' };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Content script error',
    };
  }
}
