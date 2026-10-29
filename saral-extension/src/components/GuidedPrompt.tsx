import type { Field } from '@/lib/schema/types';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { FieldMic } from './FieldMic';

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
  function speak(): void {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(
      field.hint ? `${field.label}. ${field.hint}` : field.label,
    );
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="card px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {language === 'hi' ? 'अगला सवाल' : 'Next question'}
      </p>
      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-slate-900">
        {field.label}
        {field.required && <span className="ml-0.5 text-brand-500">*</span>}
      </p>
      {field.hint && <p className="mt-1 text-[12px] text-slate-500">{field.hint}</p>}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={speak}
          className="btn-ghost"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
          </svg>
          {t('speakQuestion', language)}
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="btn-ghost"
          >
            {language === 'hi' ? 'छोड़ें' : 'Skip'}
          </button>
        )}
        {onRecorded && (
          <FieldMic
            onRecorded={onRecorded}
            language={language}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
