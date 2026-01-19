import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from './locales/he.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            he: {
                translation: he
            }
        },
        lng: 'he', // Default language
        fallbackLng: 'he',

        interpolation: {
            escapeValue: false // React already escapes values
        }
    });

export default i18n;
