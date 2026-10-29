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

const PRIMARY = 'btn-primary';
const SECONDARY = 'btn-secondary';



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

  const currentStepIndex = STEPS.indexOf(screen);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white px-4 pb-0 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[17px] font-bold tracking-tight text-slate-900">
              {t('appName', language)}
            </h1>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {schema
                ? `${schema.fields.length} ${t('fieldsFound', language)}`
                : t('scanPage', language)}
            </p>
          </div>
          <LanguageToggle value={language} onChange={changeLanguage} />
        </div>

        {/* Step indicator — thin progress bar + labels */}
        <nav className="mt-4" aria-label="Steps">
          {/* Progress track */}
          <div className="relative flex items-center">
            {STEPS.map((step, index) => {
              const isActive = screen === step;
              const isCompleted = index < currentStepIndex;
              const isDisabled = !schema && step !== 'scan';
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setScreen(step)}
                  disabled={isDisabled}
                  className={`flex flex-1 flex-col items-center gap-1.5 pb-3 text-center transition disabled:pointer-events-none`}
                >
                  {/* Dot */}
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                      isCompleted
                        ? 'bg-brand-600 text-white'
                        : isActive
                          ? 'bg-brand-600 text-white ring-4 ring-brand-600/20'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                      isActive ? 'text-brand-600' : isDisabled ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {t(step, language)}
                  </span>
                </button>
              );
            })}
            {/* Connecting line beneath dots */}
            <div className="absolute top-2.5 left-0 right-0 -z-10 mx-[10%] h-px bg-slate-100" />
          </div>
          {/* Active underline */}
          <div className="h-px bg-slate-100" />
        </nav>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {error && (
          <Banner tone="error" message={error} onDismiss={() => setError(null)} />
        )}
        {busy && (
          <div className="animate-pulse">
            <Banner tone="info" message={t('processing', language)} />
          </div>
        )}

        {/* SCAN */}
        {screen === 'scan' && (
          <section className="space-y-4">
            {schema ? (
              <FormOverview schema={schema} language={language} />
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-4xl opacity-30">📋</span>
                <p className="text-sm font-medium text-slate-500">{t('noForm', language)}</p>
                <p className="text-xs text-slate-400">
                  {language === 'hi'
                    ? 'किसी वेब फ़ॉर्म पर जाएं और स्कैन करें।'
                    : 'Navigate to a web form, then tap Scan.'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setScreen('speak')}
                disabled={!schema || schema.fields.length === 0}
                className={PRIMARY}
              >
                {t('speak', language)}
              </button>
              <button
                type="button"
                onClick={() => void scanPage()}
                disabled={busy}
                className={SECONDARY}
              >
                {schema ? t('rescan', language) : t('scanPage', language)}
              </button>
            </div>
          </section>
        )}

        {/* SPEAK */}
        {screen === 'speak' && (
          <section className="space-y-4">
            {schema && <FormOverview schema={schema} language={language} />}

            {guidedField && (
              <GuidedPrompt
                field={guidedField}
                language={language}
                onRecorded={(blob) => void handleFieldRecording(guidedField, blob)}
                disabled={busy}
              />
            )}

            <div className="card overflow-hidden">
              <p className="border-b border-slate-50 px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
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

        {/* REVIEW */}
        {screen === 'review' && schema && (
          <section className="space-y-4">
            <ReviewSummary
              schema={schema}
              values={values}
              statuses={statuses}
              language={language}
            />

            <p className="text-[12px] text-slate-400">{t('confirmFill', language)}</p>

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

            <div className="flex flex-col gap-2">
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

        {/* DONE */}
        {screen === 'done' && (
          <section className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 stroke-brand-600" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-900">{t('doneTitle', language)}</p>
              <p className="text-[13px] leading-relaxed text-slate-500">{t('allDone', language)}</p>
            </div>
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

      {/* ── Footer ── */}
      <footer className="border-t border-slate-50 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => void browser.runtime.openOptionsPage()}
          className="text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          {t('settings', language)}
        </button>
      </footer>
    </div>
  );
}
