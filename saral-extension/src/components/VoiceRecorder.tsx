import { useEffect, useRef, useState } from 'react';
import { AudioRecorder, isPermissionError, openMicPermissionTab } from '@/lib/audio';
import type { Recording } from '@/lib/audio';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';

interface VoiceRecorderProps {
  language: Language;
  disabled?: boolean;
  onRecorded: (recording: Recording) => void | Promise<void>;
}

export function VoiceRecorder({ language, disabled = false, onRecorded }: VoiceRecorderProps) {
  const recorder = useRef<AudioRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

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
        setSeconds(0);
        if (result) await onRecorded(result);
        return;
      }

      const next = new AudioRecorder();
      await next.start();
      recorder.current = next;
      setSeconds(0);
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
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Mic button */}
      <div className="relative">
        {recording && (
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping" />
        )}
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={disabled}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 ${
            recording
              ? 'bg-red-500 shadow-lg shadow-red-200'
              : 'bg-brand-600 shadow-lg shadow-brand-200 hover:bg-brand-700 disabled:bg-slate-200 disabled:shadow-none'
          }`}
        >
          {recording ? (
            /* Stop square */
            <span className="h-5 w-5 rounded-sm bg-white" />
          ) : (
            /* Mic icon */
            <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
              <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
              <path fillRule="evenodd" d="M5 11a1 1 0 0 1 1 1 6 6 0 0 0 12 0 1 1 0 1 1 2 0 8 8 0 0 1-7 7.938V22h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-3.062A8 8 0 0 1 4 12a1 1 0 0 1 1-1Z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Status label */}
      <p className="text-center text-[13px] text-slate-500">
        {recording
          ? `${t('listening', language)} ${formatTime(seconds)}`
          : t('speakPrompt', language)}
      </p>

      {/* Waveform */}
      {recording && <Waveform />}
      {error && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-red-600">{error}</p>
          {needsPermission && (
            <button
              type="button"
              onClick={openMicPermissionTab}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              {t('grantMicPermission', language)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex h-6 items-end gap-0.5" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <span
          key={index}
          className="w-1 rounded-full bg-brand-500 animate-pulse"
          style={{
            height: `${6 + ((index * 5) % 16)}px`,
            opacity: 0.4 + (index % 3) * 0.2,
            animationDelay: `${index * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
