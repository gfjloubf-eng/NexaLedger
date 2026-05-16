import { createContext } from 'react';
import type { Locale, Currency } from './settingsConstants';

type SettingsState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
};

export const SettingsContext = createContext<SettingsState | undefined>(undefined);
