import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { Schema } from '@/lib/schema/types';
import { useSpeech } from '@/lib/useSpeech';
import { SpeakerIcon, StopIcon } from './Icons';

const MAX_CHIPS = 6;

export function FormOverview({
  schema,
  language,
}: {
  schema: Schema;
  language: Language;
}) {
  const { supported, speaking, speak, stop } = useSpeech(language);

  const title = schema.title || t('thisForm', language);
  const required = schema.fields.filter((field) => field.required);
  const shown = required.slice(0, MAX_CHIPS);
  const hidden = required.slice(MAX_CHIPS);

  const purpose = schema.purpose || (schema.title ? schema.title : t('fillThisForm', language));

  const requiredText = required.length
    ? `${t('requiredInfo', language)}: ${required.map((field) => field.label).join(', ')}`
    : t('noRequiredInfo', language);

  const hearLabel = t('hearExplanation', language);

  return (
    <section className="card overflow-hidden" aria-label={t('aboutForm', language)}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <p className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-ink-900">{purpose}</p>

        {supported && (
          <button
            type="button"
            data-icon
            aria-pressed={speaking}
            onClick={() => (speaking ? stop() : speak(`${purpose} ${requiredText}. ${t('speechHint', language)}`))}
            className="btn-ghost -mr-1.5 -mt-1 shrink-0"
            title={hearLabel}
            aria-label={hearLabel}
          >
            {speaking ? <StopIcon className="h-4 w-4" /> : <SpeakerIcon className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>

      {required.length > 0 && (
        <div className="border-t border-ink-900/[0.06] bg-ink-50/70 px-4 py-3">
          <p className="mb-2 text-[12.5px] font-medium text-ink-500">{t('requiredInfo', language)}</p>
          <div className="flex flex-wrap gap-1.5">
            {shown.map((field) => (
              <span key={field.id} className="chip">
                {field.label}
              </span>
            ))}
            {hidden.length > 0 && (
              <span className="chip text-ink-500" title={hidden.map((field) => field.label).join(', ')}>
                +{hidden.length}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}