import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { AudioRecorder, isPermissionError, openMicPermissionTab } from '@/lib/audio';
import type { Recording } from '@/lib/audio';
import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { Banner } from './Banner';
import { MicIcon, StopIcon } from './Icons';

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
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      {/* Mic: two offset ripples while recording, so it feels like it is listening. */}
      <div className="relative grid h-24 w-24 place-items-center">
        {recording && (
          <>
            <span aria-hidden="true" className="rec-ripple absolute h-[72px] w-[72px] rounded-full bg-red-500/30" />
            <span
              aria-hidden="true"
              className="rec-ripple absolute h-[72px] w-[72px] rounded-full bg-red-500/30"
              style={{ animationDelay: '0.95s' }}
            />
          </>
        )}
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={disabled}
          data-recording={recording}
          aria-pressed={recording}
          aria-label={recording ? t('stopListening', language) : t('startSpeaking', language)}
          className="mic-btn"
        >
          {recording ? <StopIcon className="h-6 w-6" /> : <MicIcon className="h-8 w-8" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Status. Fixed height so the layout doesn't jump when recording starts. */}
      <div className="flex min-h-[52px] flex-col items-center gap-2" aria-live="polite">
        {recording ? (
          <>
            <p className="flex items-center gap-2 text-[14px] font-semibold text-ink-900">
              <span aria-hidden="true" className="rec-dot h-1.5 w-1.5 rounded-full bg-red-500" />
              {t('listening', language)}
              <span className="font-medium tabular-nums text-ink-500">{formatTime(seconds)}</span>
            </p>
            <Waveform />
          </>
        ) : (
          <p className="max-w-[17rem] text-center text-[14px] leading-snug text-ink-500">
            {t('speakPrompt', language)}
          </p>
        )}
      </div>

      {error && (
        <div className="w-full">
          <Banner
            tone="error"
            message={error}
            onDismiss={() => setError(null)}
            action={
              needsPermission
                ? {
                    label: t('grantMicPermission', language),
                    onClick: () => {
                      void openMicPermissionTab();
                    },
                  }
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}

const BARS = 21;

/** Bell-shaped envelope with desynchronised bars: reads as speech, not a loader. */
function Waveform() {
  const mid = (BARS - 1) / 2;
  return (
    <div className="flex h-7 items-center gap-[3px] text-brand-500" aria-hidden="true">
      {Array.from({ length: BARS }, (_, index) => {
        const weight = 1 - Math.abs(index - mid) / mid;
        const style = {
          height: `${8 + Math.round(weight * 18)}px`,
          opacity: 0.4 + weight * 0.6,
          '--d': `${0.85 + ((index * 7) % 5) * 0.13}s`,
          '--delay': `${-((index * 113) % 800)}ms`,
        } as CSSProperties;
        return <span key={index} className="wave-bar" style={style} />;
      })}
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`;
}