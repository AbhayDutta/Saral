import { AppError } from '../errors';
import { getSettings } from '../storage';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  fallbackModel?: string;
  temperature?: number;
  json?: boolean;
}

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const settings = await getSettings();
  if (!settings.openrouterApiKey) {
    throw new AppError('missing-key', 'Add your OpenRouter API key in Settings first.');
  }

  const models = Array.from(
    new Set(
      [options.model ?? settings.extractionModel, options.fallbackModel ?? settings.fallbackModel].filter(
        (model): model is string => Boolean(model),
      ),
    ),
  );

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await callModel(model, messages, options, settings.openrouterApiKey);
      } catch (error) {
        lastError = error;
        if (error instanceof AppError && error.code === 'missing-key') throw error;
        await wait(250 * (attempt + 1));
      }
    }
  }

  if (lastError instanceof AppError) throw lastError;
  throw new AppError('api', 'OpenRouter request failed. Please try again.');
}

async function callModel(
  model: string,
  messages: ChatMessage[],
  options: ChatOptions,
  apiKey: string,
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://saral.app',
        'X-Title': 'Saral',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
  } catch {
    throw new AppError('network', "Couldn't reach OpenRouter. Check your connection.");
  }

  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new AppError('api', `OpenRouter ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AppError('parse', 'OpenRouter returned an empty response.');

  return content;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
