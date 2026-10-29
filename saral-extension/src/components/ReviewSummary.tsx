import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { FieldStatus, Schema } from '@/lib/schema/types';

export function ReviewSummary({
  schema,
  values,
  statuses,
  language,
}: {
  schema: Schema;
  values: Record<string, string>;
  statuses: Record<string, FieldStatus>;
  language: Language;
}) {
  const filled = schema.fields.filter((field) => Boolean(values[field.id])).length;
  const missing = schema.fields.filter((field) => field.required && !values[field.id]);
  const flagged = schema.fields.filter(
    (field) => statuses[field.id] === 'invalid' || statuses[field.id] === 'needs-review',
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat value={filled} label={t('filled', language)} />
        <Stat value={missing.length} label={t('missing', language)} />
        <Stat value={flagged.length} label={t('invalid', language)} />
      </div>

      {missing.length > 0 && (
        <p className="mt-3 text-xs text-amber-700">
          {t('missing', language)}: {missing.map((field) => field.label).join(', ')}
        </p>
      )}
      {flagged.length > 0 && (
        <p className="mt-1 text-xs text-red-700">
          {t('invalid', language)}: {flagged.map((field) => field.label).join(', ')}
        </p>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-2 py-1.5">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
