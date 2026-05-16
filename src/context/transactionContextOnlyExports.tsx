// Component-only file for react-refresh.
import { createContext } from 'react';
import type { TransactionContextValue } from './transactionContext.types';

export const TransactionContext = createContext<TransactionContextValue | null>(null);



