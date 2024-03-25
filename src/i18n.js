import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en.json';
import translationPT from './locales/pt.json';

const resources = {
    en: {
        translation: translationEN,
    },
    pt : {
        translation: translationPT
    }
  };
  
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue:false
    },
  });
  