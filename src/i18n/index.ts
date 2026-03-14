import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

const resources = {
  'zh-CN': { translation: zhCN },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['zh-CN', 'en'],
    detection: {
      order: ['navigator'],
    },
    interpolation: {
      escapeValue: false,
    },
    load: 'currentOnly',
  });

export const detectLanguage = (): 'zh-CN' | 'en' => {
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
};

export default i18n;
