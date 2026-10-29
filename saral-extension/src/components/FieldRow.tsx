import type { Field, FieldStatus } from '@/lib/schema/types';
import type { Language } from '@/lib/i18n';
import { FieldMic } from './FieldMic';
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

export function FieldRow({
  field,
  value,
  status,
  message,
  language,
  onChange,
  onRecorded,
}: FieldRowProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <label htmlFor={field.id} className="text-sm font-medium text-slate-800">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          {field.hint && <p className="mt-0.5 text-xs text-slate-500">{field.hint}</p>}
        </div>
        <StatusBadge status={status} language={language} />
      </div>

      <div className="mt-2 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <FieldInput field={field} value={value} onChange={onChange} />
        </div>
        <FieldMic onRecorded={onRecorded} language={language} />
      </div>

      {message && (
        <p
          className={`mt-1.5 text-[11px] ${
            status === 'invalid'
              ? 'text-red-600'
              : status === 'needs-review'
                ? 'text-amber-700'
                : 'text-slate-500'
          }`}
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
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (value: string) => void;
}) {
  const shared =
    'w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

  if (field.options && field.options.length > 0 && field.type !== 'checkbox') {
    return (
      <select
        id={field.id}
        name={field.name || field.id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={shared}
      >
        <option value="">Select…</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        id={field.id}
        name={field.name || field.id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className={shared}
      />
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          id={field.id}
          name={field.name || field.id}
          type="checkbox"
          checked={value === 'true'}
          onChange={(event) => onChange(event.target.checked ? 'true' : 'false')}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600"
        />
        Yes
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
      id={field.id}
      name={field.name || field.id}
      type={inputType}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={shared}
    />
  );
}
