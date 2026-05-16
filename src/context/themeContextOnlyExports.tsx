// Intentionally component-only file for react-refresh.
import { createContext } from 'react';
import type { ThemeContextValue } from './themeProviderTypes';

export const ThemeContext = createContext<ThemeContextValue | null>(null);


