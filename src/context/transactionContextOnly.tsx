/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import type { TransactionContextValue } from './transactionContext.types';

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value: TransactionContextValue = {
    transactions: [],
    loading: false,
    addTransaction: async () => {},
    deleteTransaction: async () => {},
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      'useTransactions must be used within TransactionProvider'
    );
  }

  return context;
}