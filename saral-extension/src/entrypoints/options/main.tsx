import { StrictMode, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ChevronDown, Eye, EyeOff, Lock, Mic } from 'lucide-react';
import { Banner } from '@/components/Banner';
import { toUserMessage } from '@/lib/errors';
import { getSettings, saveSettings } from '@/lib/storage';
import type { Settings, SettingLanguage } from '@/lib/storage';
import '@/styles/globals.css'; // must include styles/premium.css

type MicState = 'idle' | 'testing' | 'granted' | 'denied';

function Options() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micState, setMicState] = useState<MicState>('idle');
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    void getSettings()
      .then(setSettings)
      .catch((caught) => setError(toUserMessage(caught)));

    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        ?.query({ name: 'microphone' as PermissionName })
        ?.then((status) => {
          if (status.state === 'granted') setMicState('granted');
          else if (status.state === 'denied') setMicState('denied');
        })
        ?.catch(() => {});
    }
  }, []);

  async function testOrGrantMic() {
    setMicState('testing');
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicState('granted');
    } catch (err) {
      setMicState('denied');
      if (err instanceof Error) {
        setMicError(err.message);
      }
    }
  }

  function update(patch: Partial<Settings>): void {
    setSettings((current) => (current ? { ...current, ...patch } : current));
    setSaved(false);
    setDirty(true);
  }

  async function save(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!settings) return;

    try {
      await saveSettings(settings);
      setSaved(true);
      setDirty(false);
      setError(null);
    } catch (caught) {
      setError(toUserMessage(caught));
    }
  }

  if (!settings) {
    return (
      <p role="status" className="p-10 text-center text-[14px] text-ink-500">
        {error ?? 'Loading…'}
      </p>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-2xl px-6 pb-32 pt-12">
        <header className="mb-8">
          <h1 className="text-[28px] font-semibold leading-tight text-ink-900">Saral settings</h1>
          <p className="mt-1.5 text-[15px] leading-snug text-ink-500">
            Connect your speech and language services, and choose how Saral talks to people.
          </p>
        </header>

        {error && (
          <div className="mb-6">
            <Banner tone="error" message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <form id="settings-form" onSubmit={(event) => void save(event)} className="space-y-9">
          <Section
            title="Connections"
            description={
              <span className="inline-flex items-start gap-1.5">
                <Lock className="mt-[3px] h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={1.8} />
                Keys stay in this browser and are only sent to Sarvam AI and OpenRouter.
              </span>
            }
          >
            <Row id="sarvam-key" label="Sarvam AI API key" hint="Used for Saaras speech-to-text.">
              <SecretInput
                id="sarvam-key"
                value={settings.sarvamApiKey}
                onChange={(value) => update({ sarvamApiKey: value })}
                placeholder="Enter your Sarvam AI API subscription key"
              />
            </Row>
            <Row
              id="openrouter-key"
              label="OpenRouter API key"
              hint="Used for extraction and Hindi labels."
            >
              <SecretInput
                id="openrouter-key"
                value={settings.openrouterApiKey}
                onChange={(value) => update({ openrouterApiKey: value })}
                placeholder="sk-or-…"
              />
            </Row>
          </Section>

          <Section
            title="Language"
            description="Speech is auto-detected, so people can speak Hindi, English, or a mix of both."
          >
            <Row
              id="default-language"
              label="Default language"
              hint="Auto matches the language of the webpage: English for English forms, Hindi for Hindi forms."
            >
              <div className="relative">
                <select
                  id="default-language"
                  value={settings.defaultLanguage}
                  onChange={(event) =>
                    update({ defaultLanguage: event.target.value as SettingLanguage })
                  }
                  className="input-base appearance-none pr-9"
                >
                  <option value="auto">Auto (match webpage language)</option>
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
                  strokeWidth={1.8}
                />
              </div>
            </Row>
          </Section>

          <Section title="Models" description="The defaults are fine unless you want a specific model.">
            <Row
              id="transcription-model"
              label="Transcription model"
              hint="Sarvam AI Saaras model: saaras:v4 (recommended) or saaras:v3."
            >
              <input
                id="transcription-model"
                value={settings.transcriptionModel}
                onChange={(event) => update({ transcriptionModel: event.target.value })}
                placeholder="saaras:v4"
                spellCheck={false}
                className="input-base font-mono text-[13px]"
              />
            </Row>
            <Row id="extraction-model" label="Extraction model">
              <input
                id="extraction-model"
                value={settings.extractionModel}
                onChange={(event) => update({ extractionModel: event.target.value })}
                spellCheck={false}
                className="input-base font-mono text-[13px]"
              />
            </Row>
            <Row id="fallback-model" label="Fallback model">
              <input
                id="fallback-model"
                value={settings.fallbackModel}
                onChange={(event) => update({ fallbackModel: event.target.value })}
                spellCheck={false}
                className="input-base font-mono text-[13px]"
              />
            </Row>
          </Section>
        </form>

        {/* Not part of the form: it never touches saved settings. */}
        <section className="mt-9 space-y-3">
          <div className="px-1">
            <h2 className="text-[15px] font-semibold text-ink-900">Microphone access</h2>
            <p className="mt-0.5 text-[13.5px] leading-snug text-ink-500">
              In Chrome, extension side panels cannot request microphone access directly.
              Permission must be granted once in an extension tab like this one.
            </p>
          </div>

          <div className="card flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
            <button
              type="button"
              onClick={() => void testOrGrantMic()}
              disabled={micState === 'testing'}
              className="btn-secondary"
            >
              <Mic className="h-4 w-4" strokeWidth={1.8} />
              {micState === 'testing'
                ? 'Testing…'
                : micState === 'granted'
                  ? 'Test microphone'
                  : 'Allow microphone'}
            </button>

            <div aria-live="polite" className="min-w-0 text-[13.5px]">
              {micState === 'granted' && (
                <span className="inline-flex items-center gap-1.5 font-medium text-brand-700">
                  <Check className="h-4 w-4" strokeWidth={2.2} />
                  Microphone allowed
                </span>
              )}
              {micState === 'denied' && (
                <span className="block font-medium text-red-600">
                  Permission failed
                  {micError && (
                    <span className="mt-0.5 block font-normal text-ink-500">{micError}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Save bar: always in reach, and it says whether there is anything to save. */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink-900/[0.07] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
          <p aria-live="polite" className="flex items-center gap-2 text-[13.5px] text-ink-500">
            {saved ? (
              <>
                <Check className="h-4 w-4 text-brand-600" strokeWidth={2.2} />
                <span className="font-medium text-brand-700">Settings saved</span>
              </>
            ) : dirty ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                Unsaved changes
              </>
            ) : (
              'No changes'
            )}
          </p>
          <button type="submit" form="settings-form" disabled={!dirty} className="btn-primary">
            Save settings
          </button>
        </div>
      </div>
    </>
  );
}

/** A titled group: heading and description outside, rows inside one card. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13.5px] leading-snug text-ink-500">{description}</p>
        )}
      </div>
      <div className="card divide-y divide-ink-900/6">{children}</div>
    </section>
  );
}

/** Label and hint on the left, control on the right; stacks on narrow screens. */
function Row({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2.5 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-start sm:gap-6">
      <div>
        <label htmlFor={id} className="text-[14.5px] font-semibold leading-tight text-ink-800">
          {label}
        </label>
        {hint && <p className="mt-1 text-[13px] leading-snug text-ink-500">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SecretInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={shown ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="input-base pr-11 font-mono text-[13px]"
      />
      <button
        type="button"
        onClick={() => setShown((current) => !current)}
        aria-label={shown ? 'Hide key' : 'Show key'}
        aria-pressed={shown}
        className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
      >
        {shown ? (
          <EyeOff className="h-4 w-4" strokeWidth={1.8} />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Options />
  </StrictMode>,
);