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
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
          recording
            ? 'animate-pulse bg-red-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40'
        }`}
      >
        {recording ? '■' : '🎙'}
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
