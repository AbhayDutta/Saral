export type BannerTone = 'info' | 'error' | 'warning' | 'success';

const TONES: Record<BannerTone, string> = {
  info: 'bg-slate-50 text-slate-600',
  error: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-brand-50 text-brand-700',
};

const DOTS: Record<BannerTone, string> = {
  info: 'bg-slate-400',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  success: 'bg-brand-500',
};

export function Banner({
  tone = 'info',
  message,
  onDismiss,
}: {
  tone?: BannerTone;
  message: string;
  onDismiss?: () => void;
}) {
  if (!message) return null;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-xl px-3.5 py-3 text-[13px] leading-snug ${TONES[tone]}`}
    >
      <span className="flex items-start gap-2">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOTS[tone]}`} aria-hidden="true" />
        <span>{message}</span>
      </span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-0.5 opacity-50 hover:opacity-100 transition-opacity"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
