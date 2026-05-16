export type TransactionCategory =
  | 'راتب'
  | 'طعام'
  | 'مواصلات'
  | 'تسوق'
  | 'فواتير'
  | 'عام'
  | (string & {});

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  created_at?: string;
}

export type TransactionContextValue = {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};


