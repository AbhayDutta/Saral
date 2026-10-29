import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { Schema } from '@/lib/schema/types';

export function FormOverview({
  schema,
  language,
}: {
  schema: Schema;
  language: Language;
}) {
  const title = schema.title || (language === 'hi' ? 'यह फ़ॉर्म' : 'this form');
  const required = schema.fields.filter((field) => field.required);

  const purpose =
    language === 'hi'
      ? schema.purpose || `यह "${title}" फ़ॉर्म भरने के लिए है।`
      : `This form is for "${title}".`;

  const requiredText = required.length
    ? `${t('requiredInfo', language)}: ${required.map((field) => field.label).join(', ')}`
    : t('noRequiredInfo', language);

  function speak(): void {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(
      `${purpose} ${requiredText}. ${t('speechHint', language)}`,
    );
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="card px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {t('aboutForm', language)}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-800">{purpose}</p>
          {required.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {required.map((field) => (
                <span key={field.id} className="chip">
                  {field.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={speak}
          className="btn-ghost shrink-0"
          title={t('hearExplanation', language)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
