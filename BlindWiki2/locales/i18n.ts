import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES } from '@/data/dummy-data';

import en from './en.json';
import es from './es.json';
import ca from './ca.json';

export type SupportedLanguage = 'en' | 'es' | 'ca';

export const createLanguageItems = (t: (key: string) => string): Array<{label: string, value: SupportedLanguage}> => [
  { label: t('settings.language.en'), value: 'en' },
  { label: t('settings.language.es'), value: 'es' },
  { label: t('settings.language.ca'), value: 'ca' },
];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    ca: { translation: ca },
  },
  lng: 'ca',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;