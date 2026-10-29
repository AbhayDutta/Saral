import { ChevronDown } from 'lucide-react';
import type { Language } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n';

export function LanguageSelect({
  value,
  onChange,
}: {
  value: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <div className="relative inline-block">
      <select
        aria-label="Language"
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="appearance-none rounded-full bg-ink-100 py-1 pl-3 pr-7 text-[12.5px] font-semibold text-ink-700 outline-none transition-colors hover:bg-ink-200 focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400"
        strokeWidth={2}
      />
    </div>
  );
}
