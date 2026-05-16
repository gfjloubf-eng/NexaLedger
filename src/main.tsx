 import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/themeProviderFactory';
import { TransactionProvider } from './context/TransactionContext';

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <TransactionProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </TransactionProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);