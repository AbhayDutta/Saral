import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';

export function TranscriptPanel({
  transcript,
  language,
}: {
  transcript: string;
  language: Language;
}) {
  if (!transcript) return null;

  return (
    <section className="rounded-lg bg-slate-50 p-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {t('transcript', language)}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-800">{transcript}</p>
    </section>
  );
}
