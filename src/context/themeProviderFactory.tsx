import React from 'react';

// Intentionally kept as a component-only file for react-refresh.
import { useEffect, useMemo, useState } from 'react';

import {
applyThemeClass,
syncThemeToSystem,
STORAGE_KEY,
} from './themeUtils';

import type { ThemeMode } from './themeProviderTypes';
import { ThemeContext } from './themeContextOnlyExports';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
children,
}) => {
// Operational stability:
// Force LIGHT mode until dark reporting continuity is fully stabilized.
const [mode, setModeState] = useState<ThemeMode>('light');

useEffect(() => {
// Always apply LIGHT mode.
applyThemeClass('light');

```
// Keep compatibility with current theme system.
const stop = syncThemeToSystem((next) => {
  setModeState('light');
  applyThemeClass('light');
});

return stop;
```

}, []);

// Keep ThemeContext API stable.
const setMode = (_next?: ThemeMode) => {
// Disabled intentionally:
// force LIGHT mode only.
setModeState('light');

```
try {
  localStorage.setItem(STORAGE_KEY, 'light');
} catch {
  // ignore
}

applyThemeClass('light');
```

};

const value = useMemo(() => {
const toggle = () => {
// Disabled intentionally.
setMode('light');
};

```
return {
  mode,
  toggle,
  setMode,
};
```

}, [mode]);

return (
<ThemeContext.Provider value={value}>
{children}
</ThemeContext.Provider>
);
};

// useTheme exported from themeProviderFactory.useTheme.ts
