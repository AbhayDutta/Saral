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
  const total = schema.fields.length;
  const filled = schema.fields.filter((field) => Boolean(values[field.id])).length;
  const missing = schema.fields.filter((field) => field.required && !values[field.id]);
  const flagged = schema.fields.filter(
    (field) => statuses[field.id] === 'invalid' || statuses[field.id] === 'needs-review',
  );
  const percent = total ? Math.round((filled / total) * 100) : 0;

  return (
    <section className="card px-4 pb-3.5 pt-3">
      <div className="grid grid-cols-3 divide-x divide-ink-900/[0.07]">
        <Stat value={filled} label={t('filled', language)} tone="filled" />
        <Stat value={missing.length} label={t('missing', language)} tone="missing" />
        <Stat value={flagged.length} label={t('invalid', language)} tone="flagged" />
      </div>

      <div
        className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      {(missing.length > 0 || flagged.length > 0) && (
        <div className="mt-3.5 space-y-2 border-t border-ink-900/[0.06] pt-3">
          {missing.length > 0 && (
            <FieldList
              label={t('missing', language)}
              items={missing.map((field) => field.label)}
              className="bg-amber-50 text-amber-800 ring-amber-600/20"
              labelClass="text-amber-700"
            />
          )}
          {flagged.length > 0 && (
            <FieldList
              label={t('invalid', language)}
              items={flagged.map((field) => field.label)}
              className="bg-red-50 text-red-700 ring-red-600/15"
              labelClass="text-red-600"
            />
          )}
        </div>
      )}
    </section>
  );
}

function FieldList({
  label,
  items,
  className,
  labelClass,
}: {
  label: string;
  items: string[];
  className: string;
  labelClass: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`mr-0.5 text-[12.5px] font-semibold ${labelClass}`}>{label}</span>
      {items.map((item) => (
        <span
          key={item}
          className={`inline-flex h-[22px] items-center rounded-full px-2 text-[12px] font-medium ring-1 ring-inset ${className}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'filled' | 'missing' | 'flagged';
}) {
  const active = {
    filled: 'text-brand-600',
    missing: 'text-amber-600',
    flagged: 'text-red-600',
  }[tone];

  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <p className={`text-[26px] font-semibold leading-none tabular-nums ${value > 0 ? active : 'text-ink-300'}`}>
        {value}
      </p>
      <p className="text-[12.5px] text-ink-500">{label}</p>
    </div>
  );
}