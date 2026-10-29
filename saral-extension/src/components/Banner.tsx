export type BannerTone = 'info' | 'error' | 'warning' | 'success';

const TONES: Record<BannerTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
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
      className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${TONES[tone]}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-base leading-none opacity-60 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
