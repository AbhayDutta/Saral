import { useEffect, useRef, useState } from 'react';
import { Banner } from '@/components/Banner';
import { FieldRow } from '@/components/FieldRow';
import { FormOverview } from '@/components/FormOverview';
import { GuidedPrompt } from '@/components/GuidedPrompt';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ReviewSummary } from '@/components/ReviewSummary';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import type { ExtractedValues } from '@/lib/ai/extract';
import { blobToBase64 } from '@/lib/audio';
import type { Recording } from '@/lib/audio';
import { toUserMessage } from '@/lib/errors';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { requestBackground } from '@/lib/messaging';
import { normalizeValue, normalizeValues } from '@/lib/schema/normalize';
import type { Field, FieldOption, FieldStatus, Schema } from '@/lib/schema/types';
import { validateField, validateSchema } from '@/lib/schema/validate';
import { getSettings, saveSettings } from '@/lib/storage';
import { useFormStore } from '@/store/formStore';

type Screen = 'scan' | 'speak' | 'review' | 'done';

const STEPS: Screen[] = ['scan', 'speak', 'review', 'done'];

const PRIMARY =
  'rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-slate-300';
const SECONDARY =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50';

export default function App() {
  const [screen, setScreen] = useState<Screen>('scan');
  const [language, setLanguage] = useState<Language>('hi');
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalSchemaRef = useRef<Schema | null>(null);
  const languageRef = useRef<Language>('hi');

  const schema = useFormStore((state) => state.schema);
  const values = useFormStore((state) => state.values);
  const statuses = useFormStore((state) => state.statuses);
  const setSchema = useFormStore((state) => state.setSchema);
  const setValues = useFormStore((state) => state.setValues);
  const setValue = useFormStore((state) => state.setValue);
  const setStatuses = useFormStore((state) => state.setStatuses);
  const setStatus = useFormStore((state) => state.setStatus);
  const applyLocalization = useFormStore((state) => state.applyLocalization);

  useEffect(() => {
    void getSettings()
      .then((settings) => {
        languageRef.current = settings.defaultLanguage;
        setLanguage(settings.defaultLanguage);
        return scanPage(settings.defaultLanguage);
      })
      .catch(() => scanPage());
    // Scan once when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function scanPage(displayLanguage: Language = languageRef.current): Promise<void> {
    setBusy(true);
    setError(null);
    setTranscript('');

    try {
      const result = await requestBackground<Schema>({ type: 'SCAN_PAGE' });
      originalSchemaRef.current = result;
      setSchema(result);
      setScreen('scan');

      if (displayLanguage === 'hi') void translateLabels(result);
    } catch (caught) {
      setError(toUserMessage(caught, languageRef.current));
    } finally {
      setBusy(false);
    }
  }

  function changeLanguage(next: Language): void {
    languageRef.current = next;
    setLanguage(next);
    void saveSettings({ defaultLanguage: next }).catch(() => {});

    if (next === 'hi') {
      const base = originalSchemaRef.current ?? schema;
      if (base) void translateLabels(base);
    } else {
      restoreOriginalLabels();
    }
  }

  async function translateLabels(base: Schema): Promise<void> {
    try {
      const translated = await requestBackground<Schema>({
        type: 'TRANSLATE',
        schema: base,
      });

      const current = useFormStore.getState().schema;
      if (languageRef.current !== 'hi' || !current || current.url !== base.url) return;

      const fields: Record<
        string,
        { label: string; hint?: string; options?: FieldOption[] }
      > = {};
      for (const field of translated.fields) {
        fields[field.id] = {
          label: field.label,
          hint: field.hint,
          options: field.options,
        };
      }

      applyLocalization({
        title: translated.title,
        purpose: translated.purpose,
        fields,
      });
    } catch {
      // Keep the original labels when translation is unavailable.
    }
  }

  function restoreOriginalLabels(): void {
    const original = originalSchemaRef.current;
    if (!original) return;

    const fields: Record<
      string,
      { label: string; hint?: string; options?: FieldOption[] }
    > = {};
    for (const field of original.fields) {
      fields[field.id] = {
        label: field.label,
        hint: field.hint,
        options: field.options,
      };
    }

    applyLocalization({
      title: original.title,
      purpose: original.purpose,
      fields,
    });
  }

  function applyExtraction(target: Schema, extracted: ExtractedValues): void {
    const normalized = normalizeValues(target, extracted.values);
    setValues(normalized, extracted.confidence);

    const validation = validateSchema(target, normalized, languageRef.current);
    const nextStatuses: Record<string, FieldStatus> = {};

    for (const field of target.fields) {
      const result = validation[field.id];
      if (!result) continue;

      const score = extracted.confidence[field.id] ?? 1;
      nextStatuses[field.id] =
        result.status === 'filled' && score < 0.6 ? 'needs-review' : result.status;
    }

    setStatuses(nextStatuses);
  }

  async function handleRecording(recording: Recording): Promise<void> {
    if (!schema) {
      setError(t('noForm', language));
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const audioBase64 = await blobToBase64(recording.blob);
      const text = await requestBackground<string>({
        type: 'TRANSCRIBE',
        audioBase64,
        mimeType: recording.mimeType,
      });

      setTranscript(text);

      if (!text.trim()) {
        setError(t('errorParse', languageRef.current));
        return;
      }

      const extracted = await requestBackground<ExtractedValues>({
        type: 'EXTRACT',
        schema,
        transcript: text,
      });

      if (Object.keys(extracted.values).length === 0) {
        setError(t('errorParse', languageRef.current));
        return;
      }

      applyExtraction(schema, extracted);
      setScreen('review');
    } catch (caught) {
      setError(toUserMessage(caught, languageRef.current));
    } finally {
      setBusy(false);
    }
  }

  async function handleFieldRecording(field: Field, blob: Blob): Promise<void> {
    if (!schema) return;

    setBusy(true);
    setError(null);

    try {
      const audioBase64 = await blobToBase64(blob);
      const text = await requestBackground<string>({
        type: 'TRANSCRIBE',
        audioBase64,
        mimeType: blob.type || 'audio/webm',
      });

      setTranscript(text);

      const extracted = await requestBackground<ExtractedValues>({
        type: 'EXTRACT',
        schema: { ...schema, fields: [field] },
        transcript: text,
      });

      const raw = extracted.values[field.id];
      if (!raw) {
        setError(t('errorParse', languageRef.current));
        return;
      }

      const normalized = normalizeValue(field, raw);
      const result = validateField(field, normalized, languageRef.current);
      const score = extracted.confidence[field.id] ?? 1;

      setValue(field.id, normalized);
      setStatus(
        field.id,
        result.status === 'filled' && score < 0.6 ? 'needs-review' : result.status,
      );

      if (result.status === 'invalid') {
        setError(result.message ?? t('errorParse', languageRef.current));
      }
    } catch (caught) {
      setError(toUserMessage(caught, languageRef.current));
    } finally {
      setBusy(false);
    }
  }

  function handleValueChange(field: Field, value: string): void {
    setValue(field.id, value);
    setStatus(field.id, validateField(field, value, languageRef.current).status);
  }

  async function fillForm(): Promise<void> {
    if (!schema) return;

    setBusy(true);
    setError(null);

    try {
      const validation = validateSchema(schema, values, languageRef.current);
      const nextStatuses: Record<string, FieldStatus> = {};
      const fillable: Record<string, string> = {};

      for (const field of schema.fields) {
        const result = validation[field.id];
        if (!result) continue;

        nextStatuses[field.id] = result.status;
        const value = values[field.id];
        if (value && result.status !== 'invalid') fillable[field.id] = value;
      }

      setStatuses(nextStatuses);

      await requestBackground<string[]>({
        type: 'FILL',
        schema,
        values: fillable,
      });

      await requestBackground<null>({
        type: 'HIGHLIGHT',
        schema,
        values: fillable,
        statuses: nextStatuses,
      });

      setScreen('done');
    } catch (caught) {
      setError(toUserMessage(caught, languageRef.current));
    } finally {
      setBusy(false);
    }
  }

  const guidedField =
    schema?.fields.find((field) => field.required && !values[field.id]) ??
    schema?.fields.find((field) => !values[field.id]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">{t('appName', language)}</h1>
            <p className="text-[11px] text-slate-500">
              {schema
                ? `${schema.fields.length} ${t('fieldsFound', language)}`
                : t('scanPage', language)}
            </p>
          </div>
          <LanguageToggle value={language} onChange={changeLanguage} />
        </div>

        <nav className="mt-2 flex gap-1" aria-label="Steps">
          {STEPS.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setScreen(step)}
              disabled={!schema && step !== 'scan'}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                screen === step
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40'
              }`}
            >
              {t(step, language)}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto p-4">
        {error && (
          <Banner tone="error" message={error} onDismiss={() => setError(null)} />
        )}
        {busy && <Banner tone="info" message={t('processing', language)} />}

        {screen === 'scan' && (
          <section className="space-y-3">
            {schema ? (
              <>
                <FormOverview schema={schema} language={language} />

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    {schema.fields.length} {t('fieldsFound', language)}
                  </p>

                  {schema.fields.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {schema.fields.slice(0, 6).map((field) => (
                        <li key={field.id} className="truncate text-xs text-slate-700">
                          • {field.label}
                          {field.required && <span className="text-red-500"> *</span>}
                        </li>
                      ))}
                      {schema.fields.length > 6 && (
                        <li className="text-xs text-slate-500">
                          +{schema.fields.length - 6}
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">{t('noForm', language)}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-700">{t('noForm', language)}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void scanPage()}
                disabled={busy}
                className={SECONDARY}
              >
                {schema ? t('rescan', language) : t('scanPage', language)}
              </button>
              <button
                type="button"
                onClick={() => setScreen('speak')}
                disabled={!schema || schema.fields.length === 0}
                className={PRIMARY}
              >
                {t('speak', language)}
              </button>
            </div>
          </section>
        )}

        {screen === 'speak' && (
          <section className="space-y-3">
            {schema && <FormOverview schema={schema} language={language} />}

            <p className="text-xs text-slate-500">{t('speechHint', language)}</p>

            {guidedField && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {t('answerThis', language)}
                </p>
                <GuidedPrompt
                  field={guidedField}
                  language={language}
                  onRecorded={(blob) => void handleFieldRecording(guidedField, blob)}
                  disabled={busy}
                />
              </div>
            )}
            <p className="text-[11px] text-slate-500">{t('guidedHint', language)}</p>

            <div className="rounded-xl border border-slate-200 bg-white">
              <p className="px-4 pt-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t('orSayAll', language)}
              </p>
              <VoiceRecorder
                language={language}
                disabled={busy || !schema}
                onRecorded={handleRecording}
              />
            </div>

            <TranscriptPanel transcript={transcript} language={language} />

            <button
              type="button"
              onClick={() => setScreen('review')}
              disabled={!schema}
              className={SECONDARY}
            >
              {t('review', language)}
            </button>
          </section>
        )}

        {screen === 'review' && schema && (
          <section className="space-y-3">
            <ReviewSummary
              schema={schema}
              values={values}
              statuses={statuses}
              language={language}
            />

            <p className="text-xs text-slate-500">{t('confirmFill', language)}</p>

            <div className="space-y-2">
              {schema.fields.map((field) => {
                const validation = validateField(
                  field,
                  values[field.id] ?? '',
                  language,
                );
                const stored = statuses[field.id] ?? 'empty';
                const status =
                  validation.status === 'filled' && stored === 'needs-review'
                    ? 'needs-review'
                    : validation.status;
                const message =
                  status === 'needs-review'
                    ? t('checkValue', language)
                    : validation.message;

                return (
                  <FieldRow
                    key={field.id}
                    field={field}
                    value={values[field.id] ?? ''}
                    status={status}
                    message={message}
                    language={language}
                    onChange={(value) => handleValueChange(field, value)}
                    onRecorded={(blob) => void handleFieldRecording(field, blob)}
                  />
                );
              })}
            </div>

            <TranscriptPanel transcript={transcript} language={language} />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void fillForm()}
                disabled={busy}
                className={PRIMARY}
              >
                {t('fillForm', language)}
              </button>
              <button
                type="button"
                onClick={() => setScreen('speak')}
                className={SECONDARY}
              >
                {t('speak', language)}
              </button>
            </div>
          </section>
        )}

        {screen === 'done' && (
          <section className="space-y-3 rounded-xl border border-emerald-200 bg-white p-4">
            <p className="text-sm text-slate-800">{t('allDone', language)}</p>
            <button
              type="button"
              onClick={() => void scanPage()}
              disabled={busy}
              className={PRIMARY}
            >
              {t('startOver', language)}
            </button>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={() => void browser.runtime.openOptionsPage()}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          {t('settings', language)}
        </button>
      </footer>
    </div>
  );
}
