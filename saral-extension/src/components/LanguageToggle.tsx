import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';

const OPTIONS = ['en', 'hi'] as const;

export function LanguageToggle({
  value,
  onChange,
}: {
  value: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Language" className="seg">
      {/* The thumb slides between the two options instead of snapping. */}
      <span
        aria-hidden="true"
        className="seg-thumb"
        style={{ transform: value === 'hi' ? 'translateX(100%)' : 'translateX(0)' }}
      />
      {OPTIONS.map((language) => {
        const active = value === language;
        return (
          <button
            key={language}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(language)}
            className={`relative z-10 rounded-full px-3.5 py-1 text-[12.5px] font-semibold transition-colors duration-150 ${
              active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {language === 'en' ? t('english', value) : t('hindi', value)}
          </button>
        );
      })}
    </div>
  );
}