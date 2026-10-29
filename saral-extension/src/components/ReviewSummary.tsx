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
    <section className="card px-4 py-3.5">
      <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
        <Stat value={filled} label={t('filled', language)} variant="filled" />
        <Stat value={missing.length} label={t('missing', language)} variant="missing" />
        <Stat value={flagged.length} label={t('invalid', language)} variant="flagged" />
      </div>

      {(missing.length > 0 || flagged.length > 0) && (
        <div className="mt-3 space-y-1 border-t border-slate-50 pt-3">
          {missing.length > 0 && (
            <p className="text-[11px] text-amber-600">
              {t('missing', language)}: {missing.map((f) => f.label).join(', ')}
            </p>
          )}
          {flagged.length > 0 && (
            <p className="text-[11px] text-red-500">
              {t('invalid', language)}: {flagged.map((f) => f.label).join(', ')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Stat({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant: 'filled' | 'missing' | 'flagged';
}) {
  const numberColor =
    variant === 'filled'
      ? 'text-brand-600'
      : variant === 'missing'
        ? value > 0
          ? 'text-amber-500'
          : 'text-slate-300'
        : value > 0
          ? 'text-red-500'
          : 'text-slate-300';

  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <p className={`text-2xl font-bold tabular-nums ${numberColor}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
