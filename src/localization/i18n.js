import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to CHAFADIA NOOR',
      login: 'Login',
      signup: 'Signup',
    },
  },

  ar: {
    translation: {
      welcome: 'مرحبا بكم في شفادية نور',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
    },
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',

  resources,

  lng: 'en',

  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

export const loadLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem(
    'user-language'
  );

  if (savedLanguage) {
    i18n.changeLanguage(savedLanguage);
  }
};

export default i18n;