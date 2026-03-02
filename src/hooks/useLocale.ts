import { useTranslation } from 'react-i18next';

export type Language = 'zh-CN' | 'en';

export function useLocale() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const currentLanguage = i18n.language as Language;

  return {
    t,
    currentLanguage,
    changeLanguage,
    languages: [
      { code: 'zh-CN', name: t('languages.zh-CN') },
      { code: 'en', name: t('languages.en') },
    ] as const,
  };
}
