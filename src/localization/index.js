// src/localization/index.js

import en from './en.json';
import ar from './ar.json';
import fr from './fr.json';
import ha from './ha.json';
import sw from './sw.json';
import ur from './ur.json';
import tr from './tr.json';
import id from './id.json';

export const translations = {
  en,
  ar,
  fr,
  ha,
  sw,
  ur,
  tr,
  id,
};

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' },
  { code: 'ha', name: 'Hausa' },
  { code: 'sw', name: 'Kiswahili' },
  { code: 'ur', name: 'اردو' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'id', name: 'Bahasa Indonesia' },
];

export const getTranslation = (language = 'en') => {
  return translations[language] || translations.en;
};

export default translations;