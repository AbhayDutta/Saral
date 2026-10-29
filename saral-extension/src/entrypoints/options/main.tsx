import { StrictMode, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { toUserMessage } from '@/lib/errors';
import type { Language } from '@/lib/i18n';
import { getSettings, saveSettings } from '@/lib/storage';
import type { Settings } from '@/lib/storage';
import '@/styles/globals.css';

function Options() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getSettings()
      .then(setSettings)
      .catch((caught) => setError(toUserMessage(caught)));
  }, []);

  function update(patch: Partial<Settings>): void {
    setSettings((current) => (current ? { ...current, ...patch } : current));
    setSaved(false);
  }

  async function save(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!settings) return;

    try {
      await saveSettings(settings);
      setSaved(true);
      setError(null);
    } catch (caught) {
      setError(toUserMessage(caught));
    }
  }

  if (!settings) {
    return <p className="p-6 text-sm text-slate-500">Loading…</p>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold text-slate-900">Saral settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Keys stay in this browser and are only sent to Groq and OpenRouter.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Speech is auto-detected, so people can speak Hindi, English, or a mix of
        both.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Settings saved.
        </p>
      )}

      <form onSubmit={(event) => void save(event)} className="mt-6 space-y-5">
        <Field label="Groq API key" hint="Used for speech-to-text.">
          <input
            type="password"
            autoComplete="off"
            value={settings.groqApiKey}
            onChange={(event) => update({ groqApiKey: event.target.value })}
            className={INPUT}
            placeholder="gsk_…"
          />
        </Field>

        <Field label="OpenRouter API key" hint="Used for extraction and Hindi labels.">
          <input
            type="password"
            autoComplete="off"
            value={settings.openrouterApiKey}
            onChange={(event) => update({ openrouterApiKey: event.target.value })}
            className={INPUT}
            placeholder="sk-or-…"
          />
        </Field>

        <Field label="Default language">
          <select
            value={settings.defaultLanguage}
            onChange={(event) => update({ defaultLanguage: event.target.value as Language })}
            className={INPUT}
          >
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </Field>

        <Field label="Transcription model">
          <input
            value={settings.transcriptionModel}
            onChange={(event) => update({ transcriptionModel: event.target.value })}
            className={INPUT}
          />
        </Field>

        <Field label="Extraction model">
          <input
            value={settings.extractionModel}
            onChange={(event) => update({ extractionModel: event.target.value })}
            className={INPUT}
          />
        </Field>

        <Field label="Fallback model">
          <input
            value={settings.fallbackModel}
            onChange={(event) => update({ fallbackModel: event.target.value })}
            className={INPUT}
          />
        </Field>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Save settings
        </button>
      </form>
    </main>
  );
}

const INPUT =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Options />
  </StrictMode>,
);
