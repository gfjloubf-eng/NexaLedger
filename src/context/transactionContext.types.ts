import type { ParsedTransaction } from '../types/transaction';

export type TransactionContextValue = {
  transactions: ParsedTransaction[];
  addTransaction: (
    t: Omit<ParsedTransaction, 'title'> & {
      title: string;
    }
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
};


