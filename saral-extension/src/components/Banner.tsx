import type { ComponentType, SVGProps } from 'react';
import { AlertIcon, CloseIcon, ErrorIcon, InfoIcon, SuccessIcon } from './Icons';

export type BannerTone = 'info' | 'error' | 'warning' | 'success';

const TONES: Record<
  BannerTone,
  { box: string; icon: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  info: {
    box: 'bg-ink-100/70 text-ink-700 ring-ink-900/[0.06]',
    icon: 'text-ink-400',
    Icon: InfoIcon,
  },
  error: {
    box: 'bg-red-50 text-red-900 ring-red-600/15',
    icon: 'text-red-500',
    Icon: ErrorIcon,
  },
  warning: {
    box: 'bg-amber-50 text-amber-900 ring-amber-600/20',
    icon: 'text-amber-500',
    Icon: AlertIcon,
  },
  success: {
    box: 'bg-brand-50 text-brand-800 ring-brand-600/20',
    icon: 'text-brand-600',
    Icon: SuccessIcon,
  },
};

export function Banner({
  tone = 'info',
  message,
  onDismiss,
  action,
}: {
  tone?: BannerTone;
  message: string;
  onDismiss?: () => void;
  /** Optional recovery step, e.g. "Allow microphone". */
  action?: { label: string; onClick: () => void };
}) {
  if (!message) return null;
  const { box, icon, Icon } = TONES[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`pop-in flex items-start gap-2.5 rounded-xl py-2.5 pl-3 pr-2 text-[13.5px] leading-snug ring-1 ring-inset ${box}`}
    >
      <Icon className={`mt-px h-[18px] w-[18px] shrink-0 ${icon}`} />

      <div className="min-w-0 flex-1 py-px">
        <p>{message}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 inline-flex h-7 items-center rounded-lg bg-white px-2.5 text-[12.5px] font-semibold text-ink-800 shadow-sm ring-1 ring-inset ring-black/10 transition-colors hover:bg-ink-50 active:scale-[0.98]"
          >
            {action.label}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md opacity-50 transition-opacity hover:bg-black/5 hover:opacity-100"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}