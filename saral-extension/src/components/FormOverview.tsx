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
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            {t('aboutForm', language)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-900">{purpose}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">{requiredText}</p>
        </div>

        <button
          type="button"
          onClick={speak}
          className="shrink-0 rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
        >
          {t('hearExplanation', language)}
        </button>
      </div>

      {required.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {required.map((field) => (
            <span
              key={field.id}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] text-emerald-800"
            >
              {field.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
