import type { Language, StringKey } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { FieldStatus } from '@/lib/schema/types';

const STYLES: Record<FieldStatus, string> = {
  empty: 'bg-slate-100 text-slate-600',
  filled: 'bg-emerald-100 text-emerald-700',
  'needs-review': 'bg-amber-100 text-amber-700',
  invalid: 'bg-red-100 text-red-700',
  skipped: 'bg-slate-200 text-slate-600',
};

const LABEL_KEYS: Record<FieldStatus, StringKey> = {
  empty: 'empty',
  filled: 'filled',
  'needs-review': 'needsReview',
  invalid: 'invalid',
  skipped: 'skipped',
};

export function StatusBadge({
  status,
  language = 'en',
}: {
  status: FieldStatus;
  language?: Language;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}
    >
      {t(LABEL_KEYS[status], language)}
    </span>
  );
}
