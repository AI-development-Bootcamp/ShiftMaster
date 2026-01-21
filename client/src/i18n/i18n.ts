import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from './locales/he.json';

const initI18n = async () => {
  try {
    await i18n
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
  } catch (error) {
    console.error({ code: 'I18N_INIT_FAIL', message: 'Failed to initialize i18n', error });
  }
};

initI18n();

export default i18n;
