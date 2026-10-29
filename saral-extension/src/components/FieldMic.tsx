import { useEffect, useRef, useState } from 'react';
import { AudioRecorder, isPermissionError, openMicPermissionTab } from '@/lib/audio';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { CloseIcon, MicIcon, StopIcon } from './Icons';

export function FieldMic({
  onRecorded,
  language,
  disabled = false,
  variant = 'subtle',
}: {
  onRecorded: (blob: Blob) => void;
  language: Language;
  disabled?: boolean;
  /** 'subtle' sits beside an input; 'primary' is the main action of a prompt. */
  variant?: 'subtle' | 'primary';
}) {
  const recorder = useRef<AudioRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => () => recorder.current?.cancel(), []);

  async function toggle(): Promise<void> {
    if (disabled) return;
    setError(null);
    setNeedsPermission(false);

    try {
      if (recording) {
        const result = await recorder.current?.stop();
        recorder.current = null;
        setRecording(false);
        if (result) onRecorded(result.blob);
        return;
      }

      const next = new AudioRecorder();
      await next.start();
      recorder.current = next;
      setRecording(true);
    } catch (caught) {
      setRecording(false);
      recorder.current = null;
      setError(t('micError', language));
      setNeedsPermission(isPermissionError(caught));
      console.warn(caught);
    }
  }

  const hi = language === 'hi';
  const primary = variant === 'primary';

  const size = primary ? 'h-11 w-11' : 'h-10 w-10';
  const tone = primary
    ? recording
      ? 'bg-red-500 text-white shadow-[0_8px_18px_-8px_rgb(217_45_58/0.8)]'
      : 'bg-brand-600 text-white shadow-[0_8px_18px_-8px_rgb(21_125_93/0.8)] hover:bg-brand-700'
    : recording
      ? 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-300'
      : 'bg-ink-100 text-ink-500 hover:bg-ink-200/70 hover:text-ink-800';

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={disabled}
        title={hi ? 'यह जानकारी बोलें' : 'Speak this field'}
        aria-label={
          recording
            ? hi ? 'रिकॉर्डिंग रोकें' : 'Stop recording'
            : hi ? 'बोलकर भरें' : 'Record this field'
        }
        aria-pressed={recording}
        className={`relative grid place-items-center rounded-full transition-[background-color,color,box-shadow,transform] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${size} ${tone}`}
      >
        {recording && (
          <span
            aria-hidden="true"
            className={`rec-ripple absolute inset-0 rounded-full ${primary ? 'bg-red-500/30' : 'bg-red-500/25'}`}
          />
        )}
        {recording ? (
          <StopIcon className="relative h-[18px] w-[18px]" />
        ) : (
          <MicIcon className="relative h-[18px] w-[18px]" />
        )}
      </button>

      {error && (
        <div
          role="alert"
          className="popover pop-in absolute right-0 top-full z-20 mt-2 w-56 p-3 text-left"
        >
          <div className="flex items-start gap-2">
            <p className="flex-1 text-[12.5px] leading-snug text-ink-700">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className="-mr-1 -mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>
          {needsPermission && (
            <button
              type="button"
              onClick={() => void openMicPermissionTab()}
              className="mt-2.5 inline-flex h-7 items-center rounded-lg bg-brand-600 px-2.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[0.98]"
            >
              {t('grantMicPermission', language)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}