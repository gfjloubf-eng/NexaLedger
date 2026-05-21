// Compatibility layer: keep the foundation engine isolated from
// the app's transaction type + Supabase shapes.

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  title?: string;
  amount: number;
  type: TransactionType;
  category?: string;
  created_at?: string;
};

