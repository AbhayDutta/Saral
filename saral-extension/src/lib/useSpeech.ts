import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '@/lib/i18n';
import { SARVAM_CODE_MAP } from '@/lib/i18n';

export function useSpeech(language: Language) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const current = useRef<SpeechSynthesisUtterance | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    current.current = null;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SARVAM_CODE_MAP[language] ?? 'en-IN';

      // Only the latest utterance may flip the state, so a cancelled one can't
      // switch the indicator off while a new one is starting.
      const finish = () => {
        if (current.current === utterance && mounted.current) {
          current.current = null;
          setSpeaking(false);
        }
      };
      utterance.onend = finish;
      utterance.onerror = finish;

      current.current = utterance;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    },
    [supported, language],
  );

  return { supported, speaking, speak, stop };
}