# Saral extension

Saral (सरल) helps people with limited digital literacy fill online forms by
speaking instead of typing. Built with WXT, React, TypeScript, Tailwind CSS v4,
Zod and Zustand.

## What it does

1. The person presses `Ctrl+Shift+S` (`Command+Shift+S` on macOS) on a form.
2. Saral scans the fields and explains the form's purpose and required fields
   in Hindi, with optional text-to-speech.
3. The person speaks in Hindi, English, or Hinglish. Sarvam AI (Saaras)
   transcribes the speech.
4. OpenRouter extracts the values and maps them to the right fields.
5. Saral normalises dates, phone numbers and spoken emails, then flags missing
   or invalid values in plain language.
6. The person fixes anything by voice or keyboard, reviews the result, and taps
   **Fill form**.
7. Saral fills the page and highlights each field. It **never submits** the
   form; the person checks the page and submits it themselves.

## Run

```bash
npm install
npm run dev
```

Load `.output/chrome-mv3-dev` in `chrome://extensions` (or use the browser WXT
opens).

## Configure

Open the extension's **Settings** page and add:

- a Sarvam AI API key for speech-to-text (Saaras)
- an OpenRouter API key for extraction, translation and form explanation

Keys are stored in `browser.storage.local` and are never bundled into the
content script. `.env.example` is only a template; do not commit `.env`.

## Checks

```bash
npm run compile
npm test
npm run build
```

## Layout

- `src/entrypoints/background.ts` — hotkey, side panel, message router, AI calls
- `src/entrypoints/content/` — the only code that touches the page
- `src/entrypoints/sidepanel/` — recording, explanation and review UI
- `src/entrypoints/options/` — API keys, language and model names
- `src/lib/ai/` — Sarvam AI transcription, OpenRouter chat, extraction, translation
- `src/lib/schema/` — schema types, validation, normalisation
- `src/components/` — reusable UI, including the Hindi form overview
- `src/tests/` — scanner, filler, validation and normalisation tests

Tailwind uses the Vite plugin, so there is no `tailwind.config.ts`.
