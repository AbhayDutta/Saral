import { extract } from '../lib/ai/extract';
import { transcribe } from '../lib/ai/groq';
import { translateSchema } from '../lib/ai/translate';
import { base64ToBlob } from '../lib/audio';
import { AppError, toUserMessage } from '../lib/errors';
import type { ExtensionResponse, PanelRequest } from '../lib/messaging';
import { requestTab } from '../lib/messaging';

type SidePanelApi = {
  open(options: { windowId: number }): Promise<void>;
  setPanelBehavior?(options: { openPanelOnActionClick: boolean }): Promise<void>;
};

export default defineBackground(() => {
  void setupSidePanel();

  browser.commands.onCommand.addListener((command) => {
    if (command === 'open-saral') void openSidePanel();
  });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    void handleRequest(message as PanelRequest).then(sendResponse);
    return true;
  });
});

async function handleRequest(request: PanelRequest): Promise<ExtensionResponse<unknown>> {
  try {
    switch (request.type) {
      case 'SCAN_PAGE': {
        const tab = await getActiveTab();
        return { ok: true, data: await requestTab(tab.id, { type: 'SCAN' }) };
      }

      case 'TRANSCRIBE': {
        const audio = base64ToBlob(request.audioBase64, request.mimeType);
        return { ok: true, data: await transcribe(audio, request.language) };
      }

      case 'EXTRACT':
        return {
          ok: true,
          data: await extract(request.schema, request.transcript, request.targetLanguage),
        };

      case 'TRANSLATE':
        return { ok: true, data: await translateSchema(request.schema) };

      case 'FILL': {
        const tab = await getActiveTab();
        const filled = await requestTab<string[]>(tab.id, {
          type: 'FILL',
          schema: request.schema,
          values: request.values,
        });
        return { ok: true, data: filled };
      }

      case 'HIGHLIGHT': {
        const tab = await getActiveTab();
        await requestTab(tab.id, {
          type: 'HIGHLIGHT',
          schema: request.schema,
          values: request.values,
          statuses: request.statuses,
        });
        return { ok: true, data: null };
      }

      case 'CLEAR_HIGHLIGHTS': {
        const tab = await getActiveTab();
        await requestTab(tab.id, { type: 'CLEAR_HIGHLIGHTS' });
        return { ok: true, data: null };
      }

      default:
        return { ok: false, error: 'Unknown request' };
    }
  } catch (error) {
    return {
      ok: false,
      error: toUserMessage(error),
      code: error instanceof AppError ? error.code : 'unknown',
    };
  }
}

async function getActiveTab(): Promise<{ id: number; windowId: number }> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new AppError('no-tab', 'Open a webpage with a form first.');
  return { id: tab.id, windowId: tab.windowId };
}

async function setupSidePanel(): Promise<void> {
  const sidePanel = getSidePanel();
  if (!sidePanel?.setPanelBehavior) return;

  try {
    await sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch {
    // Older Chromium builds do not support this method.
  }
}

async function openSidePanel(): Promise<void> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const sidePanel = getSidePanel();

  if (sidePanel && tab?.windowId !== undefined) {
    try {
      await sidePanel.open({ windowId: tab.windowId });
      return;
    } catch {
      // Fall through to a normal tab below.
    }
  }

  await browser.tabs.create({ url: browser.runtime.getURL('/sidepanel.html') });
}

function getSidePanel(): SidePanelApi | undefined {
  return (browser as unknown as { sidePanel?: SidePanelApi }).sidePanel;
}
