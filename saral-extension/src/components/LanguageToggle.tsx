import type { Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';

export function LanguageToggle({
  value,
  onChange,
}: {
  value: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-0.5">
      {(['en', 'hi'] as const).map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => onChange(language)}
          className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
            value === language
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {language === 'en' ? t('english', value) : t('hindi', value)}
        </button>
      ))}
    </div>
  );
}
