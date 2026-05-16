import React, { useEffect, useState } from 'react';
import { SettingsContext } from './SettingsContextInternal';
import { STORAGE_KEYS } from './settingsConstants';
import type { Locale, Currency } from './settingsConstants';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.locale);
      return (v as Locale) ?? 'ar';
    } catch {
      return 'ar';
    }
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.currency);
      return ((v as Currency) || 'SAR');
    } catch {
      return 'SAR';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.locale, locale);
    } catch {
      /* ignore */
    }

    // Apply document direction & lang
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
      document.body.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.currency, currency);
    } catch {
      /* ignore */
    }
  }, [currency]);

  const setLocale = (l: Locale) => setLocaleState(l);
  const setCurrency = (c: Currency) => setCurrencyState(c);

  return (
    <SettingsContext.Provider value={{ locale, setLocale, currency, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};
