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
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
        {language === 'hi' ? 'अगला सवाल' : 'Next question'}
      </p>
      <p className="mt-1 text-base font-medium text-slate-900">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </p>
      {field.hint && <p className="mt-0.5 text-sm text-slate-600">{field.hint}</p>}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={speak}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          {t('speakQuestion', language)}
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
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
