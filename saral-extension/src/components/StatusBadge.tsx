import type { Language, StringKey } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import type { FieldStatus } from '@/lib/schema/types';
import { CheckIcon } from './Icons';

const STYLES: Record<FieldStatus, string> = {
  empty: 'text-ink-400',
  filled: 'bg-brand-50 text-brand-700 ring-brand-600/15',
  'needs-review': 'bg-amber-50 text-amber-800 ring-amber-600/20',
  invalid: 'bg-red-50 text-red-700 ring-red-600/15',
  skipped: 'bg-ink-100 text-ink-500 ring-ink-900/[0.05]',
};

const LABEL_KEYS: Record<FieldStatus, StringKey> = {
  empty: 'empty',
  filled: 'filled',
  'needs-review': 'needsReview',
  invalid: 'invalid',
  skipped: 'skipped',
};

const DOT_COLORS: Record<FieldStatus, string> = {
  empty: 'bg-transparent ring-1 ring-inset ring-ink-300',
  filled: 'bg-brand-500',
  'needs-review': 'bg-amber-500',
  invalid: 'bg-red-500',
  skipped: 'bg-ink-300',
};

export function StatusBadge({
  status,
  language = 'en',
}: {
  status: FieldStatus;
  language?: Language;
}) {
  const quiet = status === 'empty';

  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full text-[11.5px] font-medium leading-none ${
        quiet ? 'px-0.5' : 'px-2 ring-1 ring-inset'
      } ${STYLES[status]}`}
    >
      {status === 'filled' ? (
        <CheckIcon className="h-3 w-3" strokeWidth={2.2} />
      ) : (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[status]}`} aria-hidden="true" />
      )}
      {t(LABEL_KEYS[status], language)}
    </span>
  );
}