import type { Field } from '@/lib/schema/types';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { useSpeech } from '@/lib/useSpeech';
import { FieldMic } from './FieldMic';
import { SkipIcon, SpeakerIcon, StopIcon } from './Icons';

export function GuidedPrompt({
  field,
  language,
  onSkip,
  onRecorded,
  disabled = false,
}: {
  field: Field;
  language: Language;
  onSkip?: () => void;
  onRecorded?: (blob: Blob) => void;
  disabled?: boolean;
}) {
  const { supported, speaking, speak, stop } = useSpeech(language);

  return (
    // The only tinted, larger-radius surface in the panel: it is the thing to do next.
    <section
      className="card-hero px-4 pb-3.5 pt-4"
      aria-label={t('nextQuestion', language)}
    >
      <h2 className="text-[19px] font-semibold leading-snug text-ink-900">
        {field.label}
        {field.required && (
          <span className="ml-1 text-brand-600" aria-hidden="true">
            *
          </span>
        )}
      </h2>
      {field.hint && <p className="mt-1 text-[13.5px] leading-snug text-ink-600">{field.hint}</p>}

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="-ml-2 flex items-center gap-0.5">
          {supported && (
            <button
              type="button"
              aria-pressed={speaking}
              onClick={() => (speaking ? stop() : speak(field.hint ? `${field.label}. ${field.hint}` : field.label))}
              className="btn-ghost"
            >
              {speaking ? <StopIcon className="h-3.5 w-3.5" /> : <SpeakerIcon className="h-4 w-4" />}
              {speaking ? t('stopSpeaking', language) : t('speakQuestion', language)}
            </button>
          )}
          {onSkip && (
            <button type="button" onClick={onSkip} className="btn-ghost">
              <SkipIcon className="h-3.5 w-3.5" />
              {t('skip', language)}
            </button>
          )}
        </div>

        {onRecorded && (
          <FieldMic onRecorded={onRecorded} language={language} disabled={disabled} variant="primary" />
        )}
      </div>
    </section>
  );
}