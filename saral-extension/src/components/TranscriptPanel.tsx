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
    <section className="rounded-xl bg-slate-50 px-4 py-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {t('transcript', language)}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{transcript}</p>
    </section>
  );
}
