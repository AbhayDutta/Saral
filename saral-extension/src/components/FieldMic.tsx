import { useEffect, useRef, useState } from 'react';
import { AudioRecorder, isPermissionError, openMicPermissionTab } from '@/lib/audio';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';

export function FieldMic({
  onRecorded,
  language,
  disabled = false,
}: {
  onRecorded: (blob: Blob) => void;
  language: Language;
  disabled?: boolean;
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

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={disabled}
        title={language === 'hi' ? 'यह जानकारी बोलें' : 'Speak this field'}
        aria-label={recording ? 'Stop recording' : 'Record this field'}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
          recording
            ? 'bg-red-50 text-red-500 ring-2 ring-red-400 ring-offset-1'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40'
        }`}
      >
        {recording ? (
          /* Stop square */
          <span className="h-3 w-3 rounded-sm bg-red-500" />
        ) : (
          /* Mic icon */
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
            <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 8 1Z" />
            <path fillRule="evenodd" d="M3.5 7.5a1 1 0 0 1 1 1 3.5 3.5 0 0 0 7 0 1 1 0 1 1 2 0 5.5 5.5 0 0 1-4.5 5.415V15h1a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2h1v-1.085A5.5 5.5 0 0 1 2.5 8.5a1 1 0 0 1 1-1Z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      {error && (
        <div className="mt-1 flex flex-col items-center gap-1 text-center">
          <span className="text-[10px] text-red-600">{error}</span>
          {needsPermission && (
            <button
              type="button"
              onClick={openMicPermissionTab}
              className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-emerald-700"
            >
              {t('grantMicPermission', language)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
