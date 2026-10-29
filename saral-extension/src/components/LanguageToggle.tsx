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
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5">
      {(['en', 'hi'] as const).map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => onChange(language)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            value === language
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'en' ? t('english', value) : t('hindi', value)}
        </button>
      ))}
    </div>
  );
}
