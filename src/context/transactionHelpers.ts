import type {
  TransactionType,
  QuickAddInput,
  TransactionCategory,
  ParsedTransaction,
} from '../types/transaction';

import type { TransactionContextValue } from './transactionContext.types';

// Keep non-React helpers outside component modules to satisfy react-refresh/only-export-components.

export type TransactionRow = {
  id: string;
  // DB may use 'title' OR 'description'
  title?: string | null;
  description?: string | null;
  amount: string | number;
  // DB may use 'type' OR 'transaction_type'
  type?: TransactionType;
  transaction_type?: TransactionType;
  category: string | null;
  created_at: string;
};

export function coerceTransactionAmount(raw: string | number): number {
  return typeof raw === 'number' ? raw : Number(raw);
}

export function defaultTransactionCategory(category: string | null | undefined): TransactionCategory {
  return (category ?? 'عام') as TransactionCategory;
}

export function formatSupabaseTransactionRow(
  row: TransactionRow,
): ParsedTransaction {
  const title = (row.title ?? row.description ?? '') as string;
  const txType = (row.type ?? row.transaction_type) as TransactionType;

  return {
    id: row.id,
    title: title || 'المعاملة',
    amount: coerceTransactionAmount(row.amount),
    type: txType,
    category: defaultTransactionCategory(row.category),
  };
}


export function isValidQuickAddInput(input: QuickAddInput): boolean {
  return typeof input === 'string' && input.trim().length > 0;
}

export function buildTransactionContextValue(
  ctx: Omit<TransactionContextValue, 'transactions'> & {
    transactions: ParsedTransaction[];
  },
): TransactionContextValue {
  return {
    transactions: ctx.transactions,
    addTransaction: ctx.addTransaction,
    deleteTransaction: ctx.deleteTransaction,
    loading: ctx.loading,
  };
}

