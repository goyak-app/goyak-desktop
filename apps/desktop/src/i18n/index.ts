import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fa from './locales/fa.json';

const SAVED_LANG_KEY = 'dubly_ui_language';

const getInitialLanguage = (): string => {
  const saved = localStorage.getItem(SAVED_LANG_KEY);
  if (saved && (saved === 'en' || saved === 'fa')) {
    return saved;
  }
  return 'en';
};

const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const updateDocumentDirection = (lang: string) => {
  const dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
};

updateDocumentDirection(initialLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(SAVED_LANG_KEY, lng);
  updateDocumentDirection(lng);
});

export default i18n;
