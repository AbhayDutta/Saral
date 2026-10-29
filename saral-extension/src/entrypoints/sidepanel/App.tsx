import { useEffect, useRef, useState } from 'react';
import { FileSearch, Mic, RotateCw, Settings } from 'lucide-react';
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
    void scanPage();

    const handleTabSwitch = () => {
      // Re-scan when user switches tabs to adapt language and schema
      void scanPage();
    };

    const tabsApi =
      typeof browser !== 'undefined' && browser.tabs
        ? browser.tabs
        : (globalThis as unknown as { chrome?: { tabs?: typeof browser.tabs } }).chrome?.tabs;

    if (tabsApi?.onActivated) {
      tabsApi.onActivated.addListener(handleTabSwitch);
      return () => {
        tabsApi.onActivated.removeListener(handleTabSwitch);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function scanPage(displayLanguage?: Language): Promise<void> {
    setBusy(true);
    setError(null);
    setTranscript('');

    try {
      const result = await requestBackground<Schema>({ type: 'SCAN_PAGE' });
      originalSchemaRef.current = result;
      setSchema(result);
      setScreen('scan');

      const settings = await getSettings().catch(() => null);
      const pref = settings?.defaultLanguage ?? 'auto';

      let targetLang: Language;
      if (displayLanguage) {
        targetLang = displayLanguage;
      } else if (pref === 'auto') {
        targetLang = result.pageLanguage ?? 'en';
      } else {
        targetLang = pref;
      }

      languageRef.current = targetLang;
      setLanguage(targetLang);

      if (targetLang === 'hi') {
        void translateLabels(result);
      } else {
        restoreOriginalLabels();
      }
    } catch (caught) {
      setError(toUserMessage(caught, languageRef.current));
    } finally {
      setBusy(false);
    }
  }

  function changeLanguage(next: Language): void {
    languageRef.current = next;
    setLanguage(next);

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
      const activeLang = languageRef.current;
      const text = await requestBackground<string>({
        type: 'TRANSCRIBE',
        audioBase64,
        mimeType: recording.mimeType,
        language: activeLang,
      });

      setTranscript(text);

      if (!text.trim()) {
        setError(t('errorParse', activeLang));
        return;
      }

      const extracted = await requestBackground<ExtractedValues>({
        type: 'EXTRACT',
        schema,
        transcript: text,
        targetLanguage: activeLang,
      });

      if (Object.keys(extracted.values).length === 0) {
        setError(t('errorParse', activeLang));
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
      const activeLang = languageRef.current;
      const text = await requestBackground<string>({
        type: 'TRANSCRIBE',
        audioBase64,
        mimeType: blob.type || 'audio/webm',
        language: activeLang,
      });

      setTranscript(text);

      const extracted = await requestBackground<ExtractedValues>({
        type: 'EXTRACT',
        schema: { ...schema, fields: [field] },
        transcript: text,
        targetLanguage: activeLang,
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
    <div className="flex min-h-dvh flex-col bg-ink-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-ink-900/6 bg-white/85 px-4 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-semibold leading-tight text-ink-900">
              {t('appName', language)}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              {schema
                ? `${schema.fields.length} ${t('fieldsFound', language)}`
                : t('scanPage', language)}
            </p>
          </div>
          <LanguageToggle value={language} onChange={changeLanguage} />
        </div>

        {/* Steps are a real sequence, so they get a progress track:
            done = soft jade, current = solid jade, upcoming = grey. */}
        <nav className="mt-3.5 grid grid-cols-4 gap-1.5" aria-label="Steps">
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
                aria-current={isActive ? 'step' : undefined}
                className="group flex flex-col gap-1.5 pb-3 text-left disabled:pointer-events-none"
              >
                <span
                  className={`h-0.75 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-brand-600' : isCompleted ? 'bg-brand-300' : 'bg-ink-200'
                  }`}
                />
                <span
                  className={`text-[13px] leading-none transition-colors ${
                    isActive
                      ? 'font-semibold text-ink-900'
                      : isCompleted
                        ? 'font-medium text-brand-700'
                        : isDisabled
                          ? 'text-ink-300'
                          : 'text-ink-500 group-hover:text-ink-800'
                  }`}
                >
                  {t(step, language)}
                </span>
              </button>
            );
          })}
        </nav>

        {busy && <div className="busy-bar" aria-hidden="true" />}
      </header>

      {/* ── Main ── (no overflow here: it would break the sticky action bar) */}
      <main className="flex-1 space-y-4 px-4 py-4">
        {error && <Banner tone="error" message={error} onDismiss={() => setError(null)} />}
        {busy && <Banner tone="info" message={t('processing', language)} />}

        {/* SCAN */}
        {screen === 'scan' && (
          <section className="space-y-4">
            {schema ? (
              <FormOverview schema={schema} language={language} />
            ) : (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-ink-400 shadow-sm ring-1 ring-ink-900/[0.07]">
                  <FileSearch className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div className="space-y-1">
                  <p className="text-[15px] font-semibold text-ink-800">{t('noForm', language)}</p>
                  <p className="mx-auto max-w-68 text-[13.5px] leading-snug text-ink-500">
                    {language === 'hi'
                      ? 'किसी वेब फ़ॉर्म पर जाएं और स्कैन करें।'
                      : 'Navigate to a web form, then tap Scan.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setScreen('speak')}
                disabled={!schema || schema.fields.length === 0}
                className={`${PRIMARY} w-full`}
              >
                <Mic className="h-4.5 w-4.5" strokeWidth={1.8} />
                {t('speak', language)}
              </button>
              <button
                type="button"
                onClick={() => void scanPage()}
                disabled={busy}
                className={`${SECONDARY} w-full`}
              >
                <RotateCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} strokeWidth={1.8} />
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
              <p className="border-b border-ink-900/6 px-4 py-2.5 text-center text-[13px] font-medium text-ink-500">
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
              className={`${SECONDARY} w-full`}
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

            <p className="px-0.5 text-[13px] leading-snug text-ink-500">{t('confirmFill', language)}</p>

            <div className="space-y-2.5">
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

            {/* Pinned, so "Fill form" is always in reach however long the form is. */}
            <div className="action-bar flex gap-2">
              <button
                type="button"
                onClick={() => setScreen('speak')}
                className={SECONDARY}
              >
                {t('speak', language)}
              </button>
              <button
                type="button"
                onClick={() => void fillForm()}
                disabled={busy}
                className={`${PRIMARY} flex-1`}
              >
                {t('fillForm', language)}
              </button>
            </div>
          </section>
        )}

        {/* DONE */}
        {screen === 'done' && (
          <section className="flex flex-col items-center gap-6 px-2 pb-6 pt-14 text-center">
            <div className="relative grid h-24 w-24 place-items-center">
              <span aria-hidden="true" className="done-ring absolute inset-0 rounded-full bg-brand-500/15" />
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 shadow-[0_16px_30px_-12px_rgb(21_125_93/0.8)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <path className="check-draw" pathLength={1} d="M5 12.5 10 17.5 19 7" />
                </svg>
              </span>
            </div>
            <div className="space-y-1.5">
              <p className="text-[21px] font-semibold leading-tight text-ink-900">{t('doneTitle', language)}</p>
              <p className="mx-auto max-w-[18rem] text-[14.5px] leading-relaxed text-ink-500">
                {t('allDone', language)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void scanPage()}
              disabled={busy}
              className={`${PRIMARY} w-full`}
            >
              {t('startOver', language)}
            </button>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-ink-900/6 bg-white px-4 py-2">
        <button
          type="button"
          onClick={() => void browser.runtime.openOptionsPage()}
          className="btn-ghost -ml-2.5"
        >
          <Settings className="h-4 w-4" strokeWidth={1.7} />
          {t('settings', language)}
        </button>
      </footer>
    </div>
  );
}