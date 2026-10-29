import type { Field, FieldStatus } from '@/lib/schema/types';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { FieldMic } from './FieldMic';
import { ChevronDownIcon } from './Icons';
import { StatusBadge } from './StatusBadge';

interface FieldRowProps {
  field: Field;
  value: string;
  status: FieldStatus;
  message?: string;
  language: Language;
  onChange: (value: string) => void;
  onRecorded: (blob: Blob) => void;
}

const MESSAGE_TONE: Partial<Record<FieldStatus, string>> = {
  invalid: 'text-red-600',
  'needs-review': 'text-amber-700',
};

export function FieldRow({
  field,
  value,
  status,
  message,
  language,
  onChange,
  onRecorded,
}: FieldRowProps) {
  const hintId = `${field.id}-hint`;
  const messageId = `${field.id}-message`;
  const describedBy =
    [field.hint ? hintId : '', message ? messageId : ''].filter(Boolean).join(' ') || undefined;

  return (
    // The card's outline carries the status (see .card[data-status] in premium.css).
    <div className="card px-3.5 pb-3.5 pt-3" data-status={status}>
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={field.id} className="text-[14px] font-semibold leading-tight text-ink-800">
          {field.label}
          {field.required && (
            <span className="ml-1 text-brand-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <StatusBadge status={status} language={language} />
      </div>

      {field.hint && (
        <p id={hintId} className="mt-0.5 text-[12.5px] leading-snug text-ink-400">
          {field.hint}
        </p>
      )}

      <div className="mt-2.5 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <FieldInput
            field={field}
            value={value}
            language={language}
            invalid={status === 'invalid'}
            describedBy={describedBy}
            onChange={onChange}
          />
        </div>
        <FieldMic onRecorded={onRecorded} language={language} />
      </div>

      {message && (
        <p
          id={messageId}
          className={`mt-2 text-[12.5px] leading-snug ${MESSAGE_TONE[status] ?? 'text-ink-500'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  language,
  invalid,
  describedBy,
  onChange,
}: {
  field: Field;
  value: string;
  language: Language;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  const shared = 'input-base';
  const common = {
    id: field.id,
    name: field.name || field.id,
    'aria-invalid': invalid || undefined,
    'aria-required': field.required || undefined,
    'aria-describedby': describedBy,
  } as const;

  if (field.options && field.options.length > 0 && field.type !== 'checkbox') {
    return (
      <div className="relative">
        <select
          {...common}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${shared} appearance-none pr-9`}
        >
          <option value="">{t('selectOption', language)}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* appearance-none removes the native arrow, so draw one. */}
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        {...common}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className={`${shared} resize-none`}
      />
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-[14px] text-ink-700">
        <input
          {...common}
          type="checkbox"
          checked={value === 'true'}
          onChange={(event) => onChange(event.target.checked ? 'true' : 'false')}
          className="check"
        />
        {t('yes', language)}
      </label>
    );
  }

  const inputType =
    field.type === 'email' ||
    field.type === 'tel' ||
    field.type === 'number' ||
    field.type === 'date' ||
    field.type === 'time'
      ? field.type
      : 'text';

  return (
    <input
      {...common}
      type={inputType}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={shared}
    />
  );
}