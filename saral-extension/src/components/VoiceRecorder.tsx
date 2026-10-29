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
    <div className="flex flex-col items-center gap-3 py-6">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={disabled}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
        className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl text-white shadow-lg transition ${
          recording
            ? 'animate-pulse bg-red-600'
            : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300'
        }`}
      >
        {recording ? '■' : '🎙'}
      </button>

      <p className="text-center text-sm text-slate-600">
        {recording
          ? `${t('listening', language)} ${formatTime(seconds)}`
          : t('speakPrompt', language)}
      </p>

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
    <div className="flex h-8 items-end gap-1" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className="w-1.5 animate-pulse rounded-full bg-emerald-500"
          style={{
            height: `${8 + ((index * 7) % 24)}px`,
            animationDelay: `${index * 80}ms`,
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
