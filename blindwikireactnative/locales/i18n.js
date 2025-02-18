import i18n from "i18next";
import { initReactI18next } from "react-i18next";
//import HttpBackend from 'i18next-http-backend'; // used to load translations from a backend
//import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
import en from "./en.json";
import es from "./es.json";
import ca from "./ca.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  ca: { translation: ca },
};

i18n.init({
  resources,
  fallbackLng: "en",
  debug: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
