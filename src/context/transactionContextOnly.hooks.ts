import { useContext } from 'react';

import { TransactionContext } from './transactionContextOnlyExports';

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error('useTransactions must be used within provider');
  }

  return context;
}

