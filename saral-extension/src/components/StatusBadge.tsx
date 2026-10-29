import type { Language, StringKey } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { FieldStatus } from '@/lib/schema/types';

const STYLES: Record<FieldStatus, string> = {
  empty: 'text-slate-400',
  filled: 'text-brand-600',
  'needs-review': 'text-amber-500',
  invalid: 'text-red-500',
  skipped: 'text-slate-400',
};

const LABEL_KEYS: Record<FieldStatus, StringKey> = {
  empty: 'empty',
  filled: 'filled',
  'needs-review': 'needsReview',
  invalid: 'invalid',
  skipped: 'skipped',
};

const DOT_COLORS: Record<FieldStatus, string> = {
  empty: 'bg-slate-200',
  filled: 'bg-brand-500',
  'needs-review': 'bg-amber-400',
  invalid: 'bg-red-500',
  skipped: 'bg-slate-300',
};

export function StatusBadge({
  status,
  language = 'en',
}: {
  status: FieldStatus;
  language?: Language;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[status]}`} aria-hidden="true" />
      {t(LABEL_KEYS[status], language)}
    </span>
  );
}
