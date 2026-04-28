/**
 * Language Context
 * Google Service: Google Translate API (via backend)
 * Manages app-wide language selection and translation
 */
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const LangContext = createContext(null);

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳' },
];

export const LangProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Translate text to current language
   * @param {string} text - Text to translate
   * @param {string} [source] - Source language (default: 'en')
   * @returns {Promise<string>} Translated text
   */
  const translate = useCallback(async (text, source = 'en') => {
    if (!text || currentLang === source) return text;
    setIsTranslating(true);
    try {
      const { data } = await api.post('/translate', { text, target: currentLang, source });
      return data.translatedText || text;
    } catch {
      return text; // Fallback to original
    } finally {
      setIsTranslating(false);
    }
  }, [currentLang]);

  const changeLanguage = (code) => {
    setCurrentLang(code);
    document.documentElement.lang = code;
  };

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <LangContext.Provider value={{ currentLang, currentLangObj, changeLanguage, translate, isTranslating, LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
};
