import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { MicIcon } from './Icons';

export function TranscriptPanel({
  transcript,
  language,
}: {
  transcript: string;
  language: Language;
}) {
  if (!transcript) return null;

  // Not a card: it is a quotation of what the person just said, so it gets a quote rule.
  return (
    <section className="pop-in px-1 py-1">
      <h3 className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-400">
        <MicIcon className="h-3.5 w-3.5" />
        {t('transcript', language)}
      </h3>
      <p className="mt-1.5 border-l-2 border-brand-500/40 pl-3 text-[14.5px] leading-relaxed text-ink-700">
        {transcript}
      </p>
    </section>
  );
}